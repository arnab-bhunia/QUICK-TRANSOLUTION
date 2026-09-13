import Job, { JOB_STATUSES, QUESTION_TYPES } from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import AuditLog from "../models/AuditLog.js";
import { generateUniqueJobSlug } from "../utils/jobSlug.js";

const PUBLIC_LIST_LIMIT = 20;

// Fields safe to send to the public listing — never leaks createdBy/
// updatedBy (internal AdminUser references) or the full body sections,
// which only the job-details page needs.
const PUBLIC_LIST_FIELDS =
  "title slug department employmentType location workMode experience shortDescription closingDate publishedAt";

const EMPLOYMENT_TYPES = ["full_time", "part_time", "contract", "internship", "temporary"];
const WORK_MODES = ["on_site", "remote", "hybrid"];

// =============================================================================
// PUBLIC — /api/careers
// =============================================================================

// Only ever shows jobs that are OPEN *and* whose closing date (if any)
// has not passed — enforced here against the current SERVER time, never
// left to the frontend to filter out stale results.
function publicListFilter() {
  const now = new Date();
  return {
    status: "OPEN",
    $or: [{ closingDate: null }, { closingDate: { $gte: now } }],
  };
}

export async function listPublicJobs(req, res) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || PUBLIC_LIST_LIMIT, 50);
  const { department, employmentType, workMode, search } = req.query;

  const query = publicListFilter();
  if (department) query.department = department;
  if (employmentType && EMPLOYMENT_TYPES.includes(employmentType)) {
    query.employmentType = employmentType;
  }
  if (workMode && WORK_MODES.includes(workMode)) query.workMode = workMode;
  if (search?.trim()) query.$text = { $search: search.trim() };

  const [items, total, departments] = await Promise.all([
    Job.find(query)
      .select(PUBLIC_LIST_FIELDS)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Job.countDocuments(query),
    // Powers a department filter dropdown on the Careers page — always
    // computed from the full set of currently-open jobs, not just the
    // current page of results.
    Job.distinct("department", publicListFilter()),
  ]);

  res.json({
    items,
    page,
    totalPages: Math.max(Math.ceil(total / limit), 1),
    total,
    departments: departments.sort(),
  });
}

export async function getPublicJobBySlug(req, res) {
  let job = await Job.findOne({ slug: req.params.slug });

  if (!job) {
    job = await Job.findOne({ previousSlugs: req.params.slug });
  }

  // DRAFT is never publicly visible. ARCHIVED is retained purely for
  // historical/admin purposes (spec section 7) — not shown on a public
  // URL either. OPEN and CLOSED (including auto-closed-by-date) DO
  // remain visible on direct link, so a candidate who bookmarked/shared
  // the page still sees an accurate "this role has closed" state
  // instead of a bare 404.
  if (!job || ["DRAFT", "ARCHIVED"].includes(job.status)) {
    return res.status(404).json({ message: "Job not found." });
  }

  res.json({
    job,
    isOpenForApplications: job.isOpenForApplications(),
    canonicalSlug: job.slug,
  });
}

// =============================================================================
// ADMIN — /api/admin/careers/jobs
// Every function below sits behind requireAuth + requirePermission in
// routes/adminCareers.js — that route-level gate is the real security
// boundary, following the same convention as every other admin
// controller in this codebase (blogController, shipmentController, etc).
// =============================================================================

const LIMITS = {
  title: 160,
  department: 100,
  location: 160,
  experience: 60,
  shortDescription: 300,
  questionText: 500,
};

function cleanString(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function cleanStringArray(value, { maxItems = 40, maxLength = 500 } = {}) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v) => typeof v === "string" && v.trim())
    .slice(0, maxItems)
    .map((v) => v.trim().slice(0, maxLength));
}

// Re-validated independently of whatever the client sent — the real
// enforcement point for "dynamic application questions" (spec section
// 3): a malformed/missing type or option list here would otherwise
// silently corrupt the schema HR relies on when reviewing answers later.
function cleanQuestions(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((q) => q && typeof q === "object")
    .slice(0, 30)
    .map((q, index) => {
      const type = QUESTION_TYPES.includes(q.type) ? q.type : "short_text";
      const needsOptions = type === "single_choice" || type === "multiple_choice";
      return {
        id: cleanString(q.id, 40) || `q${index + 1}_${Date.now().toString(36)}`,
        text: cleanString(q.text, LIMITS.questionText),
        type,
        required: Boolean(q.required),
        options: needsOptions ? cleanStringArray(q.options, { maxItems: 20, maxLength: 200 }) : [],
        order: Number.isFinite(q.order) ? q.order : index,
      };
    })
    .filter((q) => q.text); // a question with no text is meaningless — drop it
}

function cleanSalary(value) {
  if (!value || typeof value !== "object") return { configured: false };
  const configured = Boolean(value.configured);
  if (!configured) return { configured: false };
  return {
    configured: true,
    min: Number.isFinite(value.min) ? value.min : null,
    max: Number.isFinite(value.max) ? value.max : null,
    currency: cleanString(value.currency, 10) || "INR",
    period: value.period === "monthly" ? "monthly" : "yearly",
    note: cleanString(value.note, 200),
  };
}

// Shared validation for both create and update — every required field
// is re-checked server-side regardless of what the Job Editor UI
// already enforced client-side.
function validateAndBuildPayload(body) {
  const title = cleanString(body.title, LIMITS.title);
  const department = cleanString(body.department, LIMITS.department);
  const location = cleanString(body.location, LIMITS.location);
  const experience = cleanString(body.experience, LIMITS.experience);
  const employmentType = EMPLOYMENT_TYPES.includes(body.employmentType) ? body.employmentType : null;
  const workMode = WORK_MODES.includes(body.workMode) ? body.workMode : null;

  const errors = [];
  if (!title) errors.push("Title is required.");
  if (!department) errors.push("Department is required.");
  if (!location) errors.push("Location is required.");
  if (!experience) errors.push("Experience is required.");
  if (!employmentType) errors.push("A valid employment type is required.");
  if (!workMode) errors.push("A valid work mode is required.");

  let closingDate = null;
  if (body.closingDate) {
    const d = new Date(body.closingDate);
    if (Number.isNaN(d.getTime())) {
      errors.push("Closing date is invalid.");
    } else {
      closingDate = d;
    }
  }

  if (errors.length) {
    const err = new Error(errors.join(" "));
    err.status = 400;
    throw err;
  }

  return {
    title,
    department,
    employmentType,
    location,
    workMode,
    experience,
    salary: cleanSalary(body.salary),
    shortDescription: cleanString(body.shortDescription, LIMITS.shortDescription),
    description: typeof body.description === "string" ? body.description.slice(0, 20000) : "",
    responsibilities: cleanStringArray(body.responsibilities),
    requirements: cleanStringArray(body.requirements),
    preferredQualifications: cleanStringArray(body.preferredQualifications),
    benefits: cleanStringArray(body.benefits),
    applicationQuestions: cleanQuestions(body.applicationQuestions),
    closingDate,
  };
}

function buildAdminFilter({ status, department, search }) {
  const filter = {};
  if (status && status !== "all") {
    if (!JOB_STATUSES.includes(status)) {
      const err = new Error("Unknown status filter.");
      err.status = 400;
      throw err;
    }
    filter.status = status;
  }
  if (department && department !== "all") filter.department = department;
  if (search?.trim()) {
    filter.$text = { $search: search.trim() };
  }
  return filter;
}

// Lightweight {id, title, status} list for the Applications panel's
// "Filter by Job" dropdown — deliberately not the full listAdminJobs
// response (that carries application counts, populate calls, etc. this
// dropdown doesn't need).
export async function listJobOptionsAdmin(req, res) {
  const jobs = await Job.find({}).select("title status").sort({ createdAt: -1 }).lean();
  res.json({ items: jobs });
}

export async function listAdminJobs(req, res) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

  let filter;
  try {
    filter = buildAdminFilter(req.query);
  } catch (err) {
    return res.status(err.status || 400).json({ message: err.message });
  }

  const [items, total, applicationCounts] = await Promise.all([
    Job.find(filter)
      .select("-description -responsibilities -requirements -preferredQualifications -benefits -applicationQuestions")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Job.countDocuments(filter),
    // One aggregate for the whole page rather than N queries — counts
    // are only computed for the jobs actually being rendered.
    JobApplication.aggregate([{ $group: { _id: "$job", count: { $sum: 1 } } }]),
  ]);

  const countByJob = new Map(applicationCounts.map((row) => [String(row._id), row.count]));

  res.json({
    items: items.map((job) => ({ ...job, applicationCount: countByJob.get(String(job._id)) || 0 })),
    page,
    totalPages: Math.max(Math.ceil(total / limit), 1),
    total,
  });
}

export async function getAdminJobById(req, res) {
  const job = await Job.findById(req.params.id).populate("createdBy updatedBy", "name email");
  if (!job) return res.status(404).json({ message: "Job not found." });

  const applicationCount = await JobApplication.countDocuments({ job: job._id });
  res.json({ job, applicationCount });
}

export async function createJob(req, res) {
  const payload = validateAndBuildPayload(req.body || {});
  const slug = await generateUniqueJobSlug(payload.title);

  const job = await Job.create({
    ...payload,
    slug,
    status: "DRAFT",
    createdBy: req.user._id,
  });

  await AuditLog.create({
    job: job._id,
    action: "job_created",
    performedBy: req.user._id,
    ipAddress: req.ip,
    after: { title: job.title, status: job.status },
  });

  res.status(201).json({ job });
}

export async function updateJob(req, res) {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: "Job not found." });

  const payload = validateAndBuildPayload(req.body || {});
  const before = { title: job.title, status: job.status };

  // Only regenerate the slug (and remember the old one) if the title
  // actually changed — an unrelated edit shouldn't churn the URL.
  if (payload.title !== job.title) {
    const newSlug = await generateUniqueJobSlug(payload.title, { excludeId: job._id });
    if (!job.previousSlugs.includes(job.slug)) job.previousSlugs.push(job.slug);
    job.slug = newSlug;
  }

  Object.assign(job, payload);
  job.updatedBy = req.user._id;
  await job.save();

  await AuditLog.create({
    job: job._id,
    action: "job_updated",
    performedBy: req.user._id,
    ipAddress: req.ip,
    before,
    after: { title: job.title, status: job.status },
  });

  res.json({ job });
}

export async function deleteJob(req, res) {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: "Job not found." });

  const applicationCount = await JobApplication.countDocuments({ job: job._id });
  if (applicationCount > 0) {
    // Applications must be retained (spec: "A CLOSED job ... retains
    // all existing applications") — deleting the parent Job would
    // orphan them. Archiving is the correct action once there's any
    // application history; only an application-free job can be deleted
    // outright.
    return res.status(409).json({
      message: "This job has applications on file and cannot be deleted. Archive it instead.",
    });
  }

  await job.deleteOne();

  await AuditLog.create({
    job: job._id,
    action: "job_updated",
    performedBy: req.user._id,
    ipAddress: req.ip,
    before: { title: job.title, status: job.status },
    after: { deleted: true },
  });

  res.json({ message: "Job deleted." });
}

export async function publishJob(req, res) {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: "Job not found." });

  const before = { status: job.status };
  job.status = "OPEN";
  // Server timestamp only — never accepted from the client (spec
  // section 7).
  job.publishedAt = new Date();
  job.updatedBy = req.user._id;
  await job.save();

  await AuditLog.create({
    job: job._id,
    action: "job_published",
    performedBy: req.user._id,
    ipAddress: req.ip,
    before,
    after: { status: job.status, publishedAt: job.publishedAt },
  });

  res.json({ job });
}

export async function closeJob(req, res) {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: "Job not found." });

  const before = { status: job.status };
  job.status = "CLOSED";
  job.updatedBy = req.user._id;
  await job.save();

  await AuditLog.create({
    job: job._id,
    action: "job_closed",
    performedBy: req.user._id,
    ipAddress: req.ip,
    before,
    after: { status: job.status },
  });

  res.json({ job });
}

export async function archiveJob(req, res) {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: "Job not found." });

  const before = { status: job.status };
  job.status = "ARCHIVED";
  job.updatedBy = req.user._id;
  await job.save();

  await AuditLog.create({
    job: job._id,
    action: "job_archived",
    performedBy: req.user._id,
    ipAddress: req.ip,
    before,
    after: { status: job.status },
  });

  res.json({ job });
}

export async function duplicateJob(req, res) {
  const source = await Job.findById(req.params.id).lean();
  if (!source) return res.status(404).json({ message: "Job not found." });

  const title = `${source.title} (Copy)`;
  const slug = await generateUniqueJobSlug(title);

  const job = await Job.create({
    title,
    slug,
    department: source.department,
    employmentType: source.employmentType,
    location: source.location,
    workMode: source.workMode,
    experience: source.experience,
    salary: source.salary,
    shortDescription: source.shortDescription,
    description: source.description,
    responsibilities: source.responsibilities,
    requirements: source.requirements,
    preferredQualifications: source.preferredQualifications,
    benefits: source.benefits,
    applicationQuestions: source.applicationQuestions,
    status: "DRAFT",
    closingDate: null,
    createdBy: req.user._id,
  });

  await AuditLog.create({
    job: job._id,
    action: "job_duplicated",
    performedBy: req.user._id,
    ipAddress: req.ip,
    before: { sourceJob: source._id },
    after: { title: job.title },
  });

  res.status(201).json({ job });
}
