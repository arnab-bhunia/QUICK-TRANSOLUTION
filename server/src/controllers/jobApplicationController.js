import crypto from "node:crypto";
import ExcelJS from "exceljs";
import Job from "../models/Job.js";
import JobApplication, { APPLICATION_STATUSES } from "../models/JobApplication.js";
import AuditLog from "../models/AuditLog.js";
import Customer from "../models/Customer.js";
import { verifyToken, CLIENT_COOKIE_NAME } from "../utils/jwt.js";
import { encryptField, decryptField, hashLookupValue } from "../utils/crypto.js";
import { uploadToCloudinary, getSignedFileUrl, safeDeleteFromCloudinary } from "../utils/storage.js";
import { verifyPdfSignature } from "../middleware/uploadValidation.js";
import { generateApplicationId } from "../utils/applicationId.js";
import { sendMail } from "../utils/mailer.js";

// Careers consent policy — bumped independently of the site-wide
// Privacy Policy version (config/legal.js) since the Careers Application
// Policy can change on its own schedule. Kept here, right next to the
// code that stamps it onto every submission, the same way Blog keeps
// its own constants near their point of use.
export const CAREERS_POLICY_VERSION = "1.0";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-()\s]{6,20}$/;
// Same shape/length bounds as consentController.js's visitorId check —
// this IS the "existing client session ID and cookie system" the spec
// asks this module to reuse (see client/src/utils/visitorId.js), not a
// new session mechanism invented for Careers.
const SESSION_ID_RE = /^[a-zA-Z0-9-]{10,64}$/;

const LIMITS = {
  name: 100,
  phone: 20,
  email: 254,
  location: 200,
  currentRole: 150,
  expectedSalary: 100,
  noticePeriod: 60,
  linkedin: 300,
  github: 300,
  portfolio: 300,
  coverLetter: 5000,
  experience: 60,
};

function cleanString(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

// Best-effort — same pattern as ServiceEnquiry/consentController: never
// blocks or errors for a guest, only links the application when a valid
// logged-in customer session happens to be present.
async function tryResolveCustomerId(req) {
  const token = req.cookies?.[CLIENT_COOKIE_NAME];
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    if (payload.type !== "customer") return null;
    const exists = await Customer.exists({ _id: payload.sub });
    return exists ? payload.sub : null;
  } catch {
    return null;
  }
}

// Re-validates every dynamic question independently of the frontend —
// the actual enforcement point for "required/optional" and "answer
// must be one of the configured options" (spec section 3). Returns the
// snapshot array to store, or throws a 400 with a human-readable message.
function validateAndSnapshotAnswers(questions, rawAnswers) {
  const byId = new Map((questions || []).map((q) => [q.id, q]));
  const answerById = new Map();

  if (Array.isArray(rawAnswers)) {
    for (const a of rawAnswers) {
      if (a && typeof a.questionId === "string") answerById.set(a.questionId, a.answer);
    }
  }

  const snapshot = [];
  for (const q of questions || []) {
    const raw = answerById.get(q.id);
    const isEmpty =
      raw === undefined ||
      raw === null ||
      (typeof raw === "string" && !raw.trim()) ||
      (Array.isArray(raw) && raw.length === 0);

    if (q.required && isEmpty) {
      const err = new Error(`Please answer: "${q.text}"`);
      err.status = 400;
      throw err;
    }
    if (isEmpty) continue; // optional and unanswered — nothing to store

    let answer;
    if (q.type === "multiple_choice") {
      const values = Array.isArray(raw) ? raw : [raw];
      const invalid = values.some((v) => !q.options.includes(v));
      if (invalid) {
        const err = new Error(`Invalid selection for: "${q.text}"`);
        err.status = 400;
        throw err;
      }
      answer = values.slice(0, 20).map((v) => cleanString(v, 200));
    } else if (q.type === "single_choice") {
      if (!q.options.includes(raw)) {
        const err = new Error(`Invalid selection for: "${q.text}"`);
        err.status = 400;
        throw err;
      }
      answer = cleanString(raw, 200);
    } else if (q.type === "yes_no") {
      const normalized = typeof raw === "boolean" ? raw : String(raw).toLowerCase();
      if (![true, false, "yes", "no"].includes(normalized)) {
        const err = new Error(`Invalid answer for: "${q.text}"`);
        err.status = 400;
        throw err;
      }
      answer = normalized === true || normalized === "yes" ? "yes" : "no";
    } else if (q.type === "long_text") {
      answer = cleanString(raw, 5000);
    } else {
      answer = cleanString(raw, 500);
    }

    snapshot.push({
      questionId: q.id,
      questionText: q.text,
      questionType: q.type,
      answer,
    });
  }

  return snapshot;
}

// =============================================================================
// PUBLIC — POST /api/careers/jobs/:slug/apply
// =============================================================================

export async function submitJobApplication(req, res) {
  // --- 1. Client session -------------------------------------------------
  const sessionId =
    typeof req.body?.sessionId === "string" && SESSION_ID_RE.test(req.body.sessionId)
      ? req.body.sessionId
      : null;

  // --- job lookup + real-time OPEN/closingDate check (steps 5 & 6 of the
  // spec's numbering happen further down; job existence/eligibility is
  // checked first since nothing else matters if there's no job to apply
  // to) ------------------------------------------------------------------
  const job = await Job.findOne({ slug: req.params.slug });
  if (!job || job.status === "DRAFT" || job.status === "ARCHIVED") {
    return res.status(404).json({ message: "Job not found." });
  }
  if (!job.isOpenForApplications()) {
    return res.status(409).json({
      message: "This job is no longer accepting applications.",
    });
  }

  // --- 2. Required fields --------------------------------------------------
  const body = req.body || {};
  const name = cleanString(body.name, LIMITS.name);
  const email = cleanString(body.email, LIMITS.email).toLowerCase();
  const phone = cleanString(body.phone, LIMITS.phone);
  const location = cleanString(body.currentLocation, LIMITS.location);
  const experience = cleanString(body.totalExperience, LIMITS.experience);
  const currentRole = cleanString(body.currentRole, LIMITS.currentRole);
  const expectedSalary = cleanString(body.expectedSalary, LIMITS.expectedSalary);
  const noticePeriod = cleanString(body.noticePeriod, LIMITS.noticePeriod);
  const linkedin = cleanString(body.linkedin, LIMITS.linkedin);
  const github = cleanString(body.github, LIMITS.github);
  const portfolio = cleanString(body.portfolio, LIMITS.portfolio);
  const coverLetter = cleanString(body.coverLetter, LIMITS.coverLetter);

  if (!name || !email || !phone || !location || !experience) {
    return res.status(400).json({ message: "Please fill in all required fields." });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }
  if (!PHONE_RE.test(phone)) {
    return res.status(400).json({ message: "Please enter a valid phone number." });
  }

  // --- Same-job duplicate protection (fast path) --------------------------
  // Computed once here and reused below at JobApplication.create() so we
  // don't hash the email twice. This findOne() is a courtesy fast-path
  // only — it saves a candidate from validating/uploading a resume just
  // to be told "you already applied" — it is NOT the actual safety
  // mechanism against duplicates. Two near-simultaneous submissions could
  // both pass this check before either has written to the database; the
  // real, race-proof guarantee is the unique {emailHash, job} index on
  // JobApplication (see models/JobApplication.js) enforced atomically by
  // MongoDB at insert time and handled in the catch block below.
  const emailHash = hashLookupValue(email);
  const alreadyApplied = await JobApplication.exists({ emailHash, job: job._id });
  if (alreadyApplied) {
    return res.status(409).json({
      message: "You have already submitted an application for this position.",
    });
  }

  let rawAnswers = [];
  if (typeof body.answers === "string" && body.answers.trim()) {
    try {
      rawAnswers = JSON.parse(body.answers);
    } catch {
      return res.status(400).json({ message: "Invalid application answers." });
    }
  }

  let answers;
  try {
    answers = validateAndSnapshotAnswers(job.applicationQuestions, rawAnswers);
  } catch (err) {
    return res.status(err.status || 400).json({ message: err.message });
  }

  // --- 3. Resume -------------------------------------------------------
  if (!req.file) {
    return res.status(400).json({ message: "Please attach your resume as a PDF." });
  }
  try {
    await verifyPdfSignature(req.file.buffer);
  } catch (err) {
    return res.status(err.status || 400).json({ message: err.message });
  }

  // --- 4. Policy consent -------------------------------------------------
  const policyAccepted = body.policyAccepted === true || body.policyAccepted === "true";
  if (!policyAccepted) {
    return res
      .status(400)
      .json({ message: "Please accept the Privacy Policy and Careers/Application Policy." });
  }

  // --- 7/10. Resume storage (private) + encryption ------------------------
  const { key: resumeKey } = await uploadToCloudinary({
    buffer: req.file.buffer,
    mimeType: req.file.mimetype,
    extension: "pdf",
    folder: "careers-resumes",
    resourceType: "raw",
    type: "private",
  });

  const customerId = await tryResolveCustomerId(req);
  const now = new Date(); // single server-side "now" for both consent.acceptedAt and requestedAt-equivalent fields
  const applicationId = await generateApplicationId();

  let application;
  try {
    application = await JobApplication.create({
      applicationId,
      job: job._id,
      jobTitleSnapshot: job.title,
      jobSlugSnapshot: job.slug,

      encryptedName: encryptField(name),
      encryptedEmail: encryptField(email),
      encryptedPhone: encryptField(phone),
      encryptedLocation: encryptField(location),
      encryptedCurrentRole: currentRole ? encryptField(currentRole) : null,
      encryptedExpectedSalary: expectedSalary ? encryptField(expectedSalary) : null,
      encryptedCoverLetter: coverLetter ? encryptField(coverLetter) : null,
      emailHash,

      experience,
      noticePeriod,
      linkedin,
      github,
      portfolio,

      resume: {
        originalFileName: cleanString(req.file.originalname, 255),
        storageKey: resumeKey,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedAt: now,
      },

      answers,
      status: "NEW",
      source: "website",

      consent: {
        accepted: true,
        // SECURITY: always the server's own constant — a client-supplied
        // policyVersion (e.g. "99.0") must never be able to land in the
        // stored record. body.policyVersion is intentionally never read
        // here; the client may only DISPLAY the current version, it does
        // not get a vote in what's persisted (spec: Careers V1
        // hardening, section 8).
        policyVersion: CAREERS_POLICY_VERSION,
        acceptedAt: now, // server-generated — never trusted from the client
      },

      sessionId,
      ipAddress: req.ip,
      userAgent: cleanString(req.get("user-agent"), 300),

      timeline: [{ event: "application_submitted", detail: "Received via website", at: now }],
      candidate: customerId, // best-effort link, never required
    });
  } catch (err) {
    // The resume was already uploaded to (private) storage above — if
    // the DB write then fails for ANY reason, don't leave an orphaned
    // file behind.
    await safeDeleteFromCloudinary(resumeKey, "raw");

    // The race the fast-path check above can't fully close: two
    // near-simultaneous submissions for the same email+job both passed
    // the exists() check above before either had written to the
    // database. MongoDB's unique {emailHash, job} index (see
    // models/JobApplication.js) is what actually catches this —
    // whichever request loses the race gets a duplicate-key error
    // (E11000) here, which we turn into the same clean, candidate-facing
    // message as the fast path. No internal database details or
    // encrypted applicant data are ever exposed.
    if (err?.code === 11000) {
      return res.status(409).json({
        message: "You have already submitted an application for this position.",
      });
    }
    throw err;
  }

  // --- 13. Confirmation email (best-effort — a delivery failure must not
  // fail the application itself; the candidate already has their
  // Application ID from the response below) ------------------------------
  try {
    await sendMail({
      to: email,
      subject: `Application received — ${job.title} at Quick Transolution`,
      text: `Hi ${name},\n\nThanks for applying for the ${job.title} position at Quick Transolution. Your application has been received.\n\nApplication ID: ${applicationId}\n\nOur recruitment team will review your application and reach out if there's a match.\n\n— Quick Transolution Recruitment Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <p>Hi ${name},</p>
          <p>Thanks for applying for the <strong>${job.title}</strong> position at Quick Transolution. Your application has been received.</p>
          <p style="margin: 24px 0;">
            <span style="display:block; color:#666; font-size:13px;">Application ID</span>
            <span style="font-size:20px; font-weight:700; letter-spacing:1px;">${applicationId}</span>
          </p>
          <p>Our recruitment team will review your application and reach out if there's a match.</p>
          <p style="color:#666; font-size:13px;">— Quick Transolution Recruitment Team</p>
        </div>
      `,
    });
  } catch (err) {
    console.error(`Confirmation email failed for application ${applicationId}:`, err.message);
  }

  res.status(201).json({
    message: "Application received.",
    applicationId,
  });
}

// =============================================================================
// ADMIN — /api/admin/careers/applications
// Gated behind requireAuth + requirePermission in routes/adminCareers.js.
// =============================================================================

const MAX_SEARCH_SCAN = 500; // same rationale as serviceEnquiryController.js

function previewText(text, maxLength = 90) {
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text;
}

function toListItem(doc) {
  return {
    id: doc._id,
    applicationId: doc.applicationId,
    job: doc.job,
    jobTitle: doc.jobTitleSnapshot,
    name: decryptField(doc.encryptedName),
    email: decryptField(doc.encryptedEmail),
    experience: doc.experience,
    status: doc.status,
    source: doc.source,
    createdAt: doc.createdAt,
  };
}

function buildAdminFilter({ job, status, from, to }) {
  const filter = {};
  if (job && job !== "all") filter.job = job;
  if (status && status !== "all") {
    if (!APPLICATION_STATUSES.includes(status)) {
      const err = new Error("Unknown status filter.");
      err.status = 400;
      throw err;
    }
    filter.status = status;
  }
  if (from || to) {
    filter.createdAt = {};
    if (from) {
      const d = new Date(from);
      if (!Number.isNaN(d.getTime())) filter.createdAt.$gte = d;
    }
    if (to) {
      const d = new Date(to);
      if (!Number.isNaN(d.getTime())) filter.createdAt.$lte = d;
    }
    if (Object.keys(filter.createdAt).length === 0) delete filter.createdAt;
  }
  return filter;
}

export async function listAdminApplications(req, res) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

  let filter;
  try {
    filter = buildAdminFilter(req.query);
  } catch (err) {
    return res.status(err.status || 400).json({ message: err.message });
  }

  // Fast path — no free-text search, or the term is a full email
  // address (pushed down via emailHash). Same two-tier strategy as
  // serviceEnquiryController.listServiceEnquiriesAdmin, for the same
  // reason: encrypted columns can't be searched via a MongoDB query.
  if (!q || EMAIL_RE.test(q.toLowerCase())) {
    if (q) filter.emailHash = hashLookupValue(q.toLowerCase());

    const [docs, total] = await Promise.all([
      JobApplication.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      JobApplication.countDocuments(filter),
    ]);

    return res.json({
      items: docs.map(toListItem),
      page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      total,
    });
  }

  const candidates = await JobApplication.find(filter)
    .sort({ createdAt: -1 })
    .limit(MAX_SEARCH_SCAN)
    .lean();

  const needle = q.toLowerCase();
  const needleDigits = needle.replace(/\D/g, "");
  const matched = candidates.filter((doc) => {
    const name = decryptField(doc.encryptedName).toLowerCase();
    const phone = decryptField(doc.encryptedPhone).replace(/\D/g, "");
    return name.includes(needle) || (needleDigits && phone.includes(needleDigits));
  });

  const total = matched.length;
  const pageItems = matched.slice((page - 1) * limit, (page - 1) * limit + limit);

  res.json({
    items: pageItems.map(toListItem),
    page,
    totalPages: Math.max(Math.ceil(total / limit), 1),
    total,
    searchScanCapped: candidates.length === MAX_SEARCH_SCAN,
  });
}

export async function getAdminApplicationById(req, res) {
  const doc = await JobApplication.findById(req.params.id)
    .populate("job", "title slug status")
    .populate("internalNotes.addedBy", "name email")
    .populate("timeline.performedBy", "name email");
  if (!doc) return res.status(404).json({ message: "Application not found." });

  await AuditLog.create({
    jobApplication: doc._id,
    job: doc.job?._id || doc.job,
    action: "application_viewed",
    performedBy: req.user._id,
    ipAddress: req.ip,
  });

  res.json({
    id: doc._id,
    applicationId: doc.applicationId,
    job: doc.job,
    name: decryptField(doc.encryptedName),
    email: decryptField(doc.encryptedEmail),
    phone: decryptField(doc.encryptedPhone),
    location: decryptField(doc.encryptedLocation),
    currentRole: doc.encryptedCurrentRole ? decryptField(doc.encryptedCurrentRole) : "",
    expectedSalary: doc.encryptedExpectedSalary ? decryptField(doc.encryptedExpectedSalary) : "",
    coverLetter: doc.encryptedCoverLetter ? decryptField(doc.encryptedCoverLetter) : "",
    experience: doc.experience,
    noticePeriod: doc.noticePeriod,
    linkedin: doc.linkedin,
    github: doc.github,
    portfolio: doc.portfolio,
    resume: { originalFileName: doc.resume.originalFileName, size: doc.resume.size, mimeType: doc.resume.mimeType },
    answers: doc.answers,
    status: doc.status,
    source: doc.source,
    consent: doc.consent,
    internalNotes: doc.internalNotes,
    timeline: doc.timeline,
    createdAt: doc.createdAt,
  });
}

export async function updateApplicationStatusAdmin(req, res) {
  const { status } = req.body || {};
  if (!APPLICATION_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  const application = await JobApplication.findById(req.params.id);
  if (!application) return res.status(404).json({ message: "Application not found." });

  const before = { status: application.status };
  application.status = status;
  application.timeline.push({
    event: "status_changed",
    detail: `${before.status} → ${status}`,
    performedBy: req.user._id,
    at: new Date(),
  });
  await application.save();

  await AuditLog.create({
    jobApplication: application._id,
    job: application.job,
    action: "application_status_changed",
    performedBy: req.user._id,
    ipAddress: req.ip,
    before,
    after: { status },
  });

  res.json({ id: application._id, status: application.status });
}

export async function addApplicationNoteAdmin(req, res) {
  const text = typeof req.body?.text === "string" ? req.body.text.trim().slice(0, 2000) : "";
  if (!text) return res.status(400).json({ message: "Note text is required." });

  const application = await JobApplication.findById(req.params.id);
  if (!application) return res.status(404).json({ message: "Application not found." });

  const note = { text, addedBy: req.user._id, addedAt: new Date() };
  application.internalNotes.push(note);
  application.timeline.push({
    event: "note_added",
    performedBy: req.user._id,
    at: note.addedAt,
  });
  await application.save();

  await AuditLog.create({
    jobApplication: application._id,
    job: application.job,
    action: "application_note_added",
    performedBy: req.user._id,
    ipAddress: req.ip,
    after: { note: previewText(text, 200) },
  });

  res.status(201).json({ notes: application.internalNotes });
}

// Never returns/redirects to a permanent public link — mints a
// short-lived signed Cloudinary URL on every call, behind the
// authenticated + permission-checked route only (spec section 13/16).
export async function getApplicationResumeAdmin(req, res) {
  const download = req.query.mode === "download";

  const application = await JobApplication.findById(req.params.id).select("resume job");
  if (!application) return res.status(404).json({ message: "Application not found." });

  const signedUrl = getSignedFileUrl(application.resume.storageKey, {
    resourceType: "raw",
    expiresInSeconds: 300,
  });

  await AuditLog.create({
    jobApplication: application._id,
    job: application.job,
    action: download ? "resume_downloaded" : "resume_viewed",
    performedBy: req.user._id,
    ipAddress: req.ip,
  });

  res.json({ url: signedUrl, fileName: application.resume.originalFileName, expiresInSeconds: 300 });
}

// =============================================================================
// EXCEL EXPORT — generated server-side because applicant data is
// encrypted at rest; React never sees enough to build this file itself
// (spec section 15).
// =============================================================================

const EXPORT_COLUMNS = [
  { header: "Application ID", key: "applicationId", width: 20 },
  { header: "Job", key: "job", width: 28 },
  { header: "Candidate Name", key: "name", width: 24 },
  { header: "Email", key: "email", width: 28 },
  { header: "Phone", key: "phone", width: 16 },
  { header: "Location", key: "location", width: 22 },
  { header: "Experience", key: "experience", width: 14 },
  { header: "Current Role", key: "currentRole", width: 22 },
  { header: "Expected Salary", key: "expectedSalary", width: 18 },
  { header: "Notice Period", key: "noticePeriod", width: 16 },
  { header: "LinkedIn", key: "linkedin", width: 28 },
  { header: "GitHub", key: "github", width: 28 },
  { header: "Portfolio", key: "portfolio", width: 28 },
  { header: "Status", key: "status", width: 14 },
  { header: "Source", key: "source", width: 12 },
  { header: "Applied Date", key: "appliedDate", width: 18 },
  { header: "Resume Available", key: "resumeAvailable", width: 16 },
];

export async function exportApplicationsAdmin(req, res) {
  let filter;
  try {
    filter = buildAdminFilter(req.query);
  } catch (err) {
    return res.status(err.status || 400).json({ message: err.message });
  }

  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (q && EMAIL_RE.test(q.toLowerCase())) {
    filter.emailHash = hashLookupValue(q.toLowerCase());
  }

  // Bounded, same as the admin search fallback — an export is already
  // an explicit, deliberate admin action, so this ceiling exists purely
  // to keep one request from trying to decrypt an unbounded collection.
  const MAX_EXPORT_ROWS = 5000;
  const docs = await JobApplication.find(filter).sort({ createdAt: -1 }).limit(MAX_EXPORT_ROWS).lean();

  let rows = docs;
  if (q && !EMAIL_RE.test(q.toLowerCase())) {
    const needle = q.toLowerCase();
    const needleDigits = needle.replace(/\D/g, "");
    rows = docs.filter((doc) => {
      const name = decryptField(doc.encryptedName).toLowerCase();
      const phone = decryptField(doc.encryptedPhone).replace(/\D/g, "");
      return name.includes(needle) || (needleDigits && phone.includes(needleDigits));
    });
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Quick Transolution";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet("Applications");
  sheet.columns = EXPORT_COLUMNS;
  sheet.getRow(1).font = { bold: true };

  for (const doc of rows) {
    sheet.addRow({
      applicationId: doc.applicationId,
      job: doc.jobTitleSnapshot,
      name: decryptField(doc.encryptedName),
      email: decryptField(doc.encryptedEmail),
      phone: decryptField(doc.encryptedPhone),
      location: decryptField(doc.encryptedLocation),
      experience: doc.experience,
      currentRole: doc.encryptedCurrentRole ? decryptField(doc.encryptedCurrentRole) : "",
      expectedSalary: doc.encryptedExpectedSalary ? decryptField(doc.encryptedExpectedSalary) : "",
      noticePeriod: doc.noticePeriod,
      linkedin: doc.linkedin,
      github: doc.github,
      portfolio: doc.portfolio,
      status: doc.status,
      source: doc.source,
      appliedDate: doc.createdAt ? new Date(doc.createdAt).toLocaleString() : "",
      // Deliberately never the resume URL/key — spec section 15: "Do not
      // include public/private resume URLs in the Excel file."
      resumeAvailable: doc.resume?.storageKey ? "Yes" : "No",
    });
  }

  await AuditLog.create({
    action: "applications_exported",
    performedBy: req.user._id,
    ipAddress: req.ip,
    after: { count: rows.length, filters: req.query },
  });

  const fileName = `careers-applications-${new Date().toISOString().slice(0, 10)}-${crypto
    .randomBytes(3)
    .toString("hex")}.xlsx`;

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  await workbook.xlsx.write(res);
  res.end();
}
