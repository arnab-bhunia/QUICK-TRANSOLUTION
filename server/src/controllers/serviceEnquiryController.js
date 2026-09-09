import crypto from "node:crypto";
import ServiceEnquiry from "../models/ServiceEnquiry.js";
import ServiceEnquiryEmail, { RELEASABLE_STATUSES } from "../models/ServiceEnquiryEmail.js";
import Customer from "../models/Customer.js";
import AuditLog from "../models/AuditLog.js";
import { verifyToken, CLIENT_COOKIE_NAME } from "../utils/jwt.js";
import { encryptField, decryptField, hashLookupValue } from "../utils/crypto.js";
import { sendMail, MailUncertainError } from "../utils/mailer.js";
import { renderTiptapEmail } from "../utils/tiptapToHtml.js";

// Server-side source of truth for slug -> display title, mirroring
// client/src/config/site.js `services[].id` / `services[].title`. This
// is the only place serviceTitle is allowed to come from — never from
// the request body — so a request can't submit a valid serviceSlug
// paired with an arbitrary/misleading serviceTitle that would then show
// up as-is in the admin view.
const SERVICE_TITLES_BY_SLUG = {
  multimodal: "Multimodal Transportation",
  warehousing: "Warehousing",
  "custom-clearance": "Custom Clearance",
  "express-cargo": "Express Cargo",
  "supply-chain": "Supply Chain & 3PL",
  "import-export": "Import Export Trading",
};

// Kept as an allowlist (rather than just capping length) so this field
// can never carry arbitrary attacker-controlled text — it's used to
// power the "which service was this enquiry about" filter in the admin
// view, and to look up the trusted title above.
const KNOWN_SERVICE_SLUGS = Object.keys(SERVICE_TITLES_BY_SLUG);

// Hard server-side caps — the real enforcement point. The frontend's
// maxLength attributes are a UX nicety, not a security boundary; a
// request can always be sent directly to this endpoint bypassing the
// browser entirely, so every limit here is re-checked independent of
// whatever the client already did.
const LIMITS = {
  serviceTitle: 120,
  name: 100,
  phone: 20,
  email: 254,
  address: 300,
  message: 1500,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-()\s]{6,20}$/;

// Best-effort session check — unlike requireClientAuth, a missing or
// invalid cookie is NOT an error here. This endpoint is open to guests;
// we only use the cookie (when present and valid) to link the enquiry to
// an account, never to require one.
async function tryResolveCustomerId(req) {
  const token = req.cookies?.[CLIENT_COOKIE_NAME];
  if (!token) return null;

  try {
    const payload = verifyToken(token);
    if (payload.type !== "customer") return null;
    const exists = await Customer.exists({ _id: payload.sub });
    return exists ? payload.sub : null;
  } catch {
    return null; // expired/invalid token — treat exactly like a guest
  }
}

// Plain string check + length cap. Deliberately not a generic
// "sanitize-everything" regex replace: stripping characters from a
// person's name or address tends to mangle legitimate input (apostrophes,
// accents, etc). The actual injection defenses are (a) these fields are
// only ever used as encrypted string values, never interpolated into a
// query or a shell command, and (b) express-mongo-sanitize (already
// applied globally in app.js) strips any "$"/"." operator keys from the
// body before this controller ever sees it.
function cleanString(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export async function createServiceEnquiry(req, res) {
  const body = req.body || {};

  const serviceSlug = cleanString(body.serviceSlug, 60);
  if (!KNOWN_SERVICE_SLUGS.includes(serviceSlug)) {
    return res.status(400).json({ message: "Unknown service." });
  }

  // Derived from the already-validated serviceSlug — never taken from
  // the client. serviceSlug's allowlist check above guarantees this
  // lookup always succeeds by the time we get here.
  const serviceTitle = SERVICE_TITLES_BY_SLUG[serviceSlug];
  const name = cleanString(body.name, LIMITS.name);
  const phone = cleanString(body.phone, LIMITS.phone);
  const email = cleanString(body.email, LIMITS.email).toLowerCase();
  const address = cleanString(body.address, LIMITS.address);
  const message = cleanString(body.message, LIMITS.message);

  if (!name || !phone || !email || !address || !message) {
    return res.status(400).json({ message: "Please fill in all required fields." });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }
  if (!PHONE_RE.test(phone)) {
    return res.status(400).json({ message: "Please enter a valid phone number." });
  }
  // ~300-word cap on the free-text field, re-checked here independent of
  // the character cap above (a message can be under 1500 characters and
  // still be checked here; this just guards against extreme edge cases
  // like 1500 single-character "words" with no whitespace).
  if (message.split(/\s+/).filter(Boolean).length > 300) {
    return res.status(400).json({ message: "Please keep your message under 300 words." });
  }

  if (body.acceptedPrivacyPolicy !== true || body.acceptedTermsOfService !== true) {
    return res
      .status(400)
      .json({ message: "Please accept the Privacy Policy and Terms of Service." });
  }

  const customerId = await tryResolveCustomerId(req);
  const now = new Date();

  const enquiry = await ServiceEnquiry.create({
    serviceSlug,
    serviceTitle,
    customer: customerId,
    encryptedName: encryptField(name),
    encryptedPhone: encryptField(phone),
    encryptedEmail: encryptField(email),
    encryptedAddress: encryptField(address),
    encryptedMessage: encryptField(message),
    emailHash: hashLookupValue(email),
    consent: {
      acceptedPrivacyPolicy: true,
      acceptedTermsOfService: true,
      acceptedAt: now, // same instant as requestedAt, per the requirement
    },
    requestedAt: now,
    ipAddress: req.ip,
    userAgent: cleanString(req.get("user-agent"), 300),
  });

  await AuditLog.create({
    serviceEnquiry: enquiry._id,
    action: "created",
    performedBy: null, // public submission — no staff account involved
    ipAddress: req.ip,
    after: { serviceSlug, status: "new" },
  });

  return res.status(201).json({
    message: "Enquiry received.",
    id: enquiry._id,
  });
}

// ============================================================================
// ADMIN (STAFF) — Service Enquiries module
// Every function below is only ever reached behind requireAuth +
// requirePermission("service_enquiries:...") in routes/serviceEnquiries.js.
// That route-level gate is the real security boundary; nothing here
// re-checks req.user, by the same convention the rest of this codebase
// already follows for its other admin controllers (shipmentController,
// bookingController, etc).
// ============================================================================

const STATUSES = ["new", "contacted", "closed"];

// A short, non-sensitive preview — enough to recognize the enquiry in a
// table row without exposing the full requirement text there.
function previewMessage(message, maxLength = 90) {
  if (!message) return "";
  return message.length > maxLength ? `${message.slice(0, maxLength).trim()}…` : message;
}

// Table rows show only the last 4 digits — the full number is only ever
// decrypted/returned in the single-enquiry detail endpoint below, which
// requires the same view permission but is a deliberately separate,
// explicit request rather than something that comes along for free with
// every list page load.
function maskPhone(phone) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 4) return phone;
  return `•••• ${digits.slice(-4)}`;
}

// Decrypts a page of enquiries down to what the admin table actually
// needs to render — never the full message or full phone number (see
// maskPhone/previewMessage above).
function toListItem(doc) {
  return {
    id: doc._id,
    serviceSlug: doc.serviceSlug,
    serviceTitle: doc.serviceTitle,
    name: decryptField(doc.encryptedName),
    phoneMasked: maskPhone(decryptField(doc.encryptedPhone)),
    email: decryptField(doc.encryptedEmail),
    messagePreview: previewMessage(decryptField(doc.encryptedMessage)),
    requestedAt: doc.requestedAt,
    status: doc.status,
    assignedTo: doc.assignedTo || null,
  };
}

// Free-text search over encrypted fields (name/phone/message) can't be
// pushed down to MongoDB as a query — those columns are ciphertext, not
// plaintext, so an ordinary $regex would just never match anything (or
// worse, tempt someone into storing a plaintext shadow copy purely to
// make search easier, which is exactly what the encryption strategy
// exists to avoid). An exact email match CAN be pushed down cheaply via
// emailHash (see createServiceEnquiry) — that's the fast path. Anything
// else falls back to decrypting a bounded, already-filtered candidate
// set and matching in application code. MAX_SEARCH_SCAN caps the cost
// of that fallback; on a regional logistics site's enquiry volume this
// comfortably covers real searches without needing a dedicated search
// index for a first version.
const MAX_SEARCH_SCAN = 500;

function buildMongoFilter({ service, status, from, to }) {
  const filter = {};
  if (service && service !== "all") {
    if (!KNOWN_SERVICE_SLUGS.includes(service)) {
      const err = new Error("Unknown service filter.");
      err.status = 400;
      throw err;
    }
    filter.serviceSlug = service;
  }
  if (status && status !== "all") {
    if (!STATUSES.includes(status)) {
      const err = new Error("Unknown status filter.");
      err.status = 400;
      throw err;
    }
    filter.status = status;
  }
  if (from || to) {
    filter.requestedAt = {};
    if (from) {
      const d = new Date(from);
      if (!Number.isNaN(d.getTime())) filter.requestedAt.$gte = d;
    }
    if (to) {
      const d = new Date(to);
      if (!Number.isNaN(d.getTime())) filter.requestedAt.$lte = d;
    }
    if (Object.keys(filter.requestedAt).length === 0) delete filter.requestedAt;
  }
  return filter;
}

export async function listServiceEnquiriesAdmin(req, res) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

  let filter;
  try {
    filter = buildMongoFilter(req.query);
  } catch (err) {
    return res.status(err.status || 400).json({ message: err.message });
  }

  // Fast path: no free-text search, or the search term is itself a full
  // email address — both push entirely down to MongoDB (serviceSlug/
  // status/requestedAt are plain indexed fields; email search uses the
  // deterministic emailHash rather than decrypting anything).
  if (!q || EMAIL_RE.test(q.toLowerCase())) {
    if (q) filter.emailHash = hashLookupValue(q.toLowerCase());

    const [docs, total] = await Promise.all([
      ServiceEnquiry.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ServiceEnquiry.countDocuments(filter),
    ]);

    return res.json({
      items: docs.map(toListItem),
      page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      total,
    });
  }

  // Fallback path: name/phone/message search. Scan a bounded, already
  // status/service/date-filtered candidate set, decrypt just those, and
  // match in memory.
  const candidates = await ServiceEnquiry.find(filter)
    .sort({ createdAt: -1 })
    .limit(MAX_SEARCH_SCAN)
    .lean();

  const needle = q.toLowerCase();
  const matched = candidates.filter((doc) => {
    const name = decryptField(doc.encryptedName).toLowerCase();
    const phone = decryptField(doc.encryptedPhone);
    const phoneDigits = phone.replace(/\D/g, "");
    return (
      name.includes(needle) ||
      (needle.replace(/\D/g, "") && phoneDigits.includes(needle.replace(/\D/g, "")))
    );
  });

  const total = matched.length;
  const pageItems = matched.slice((page - 1) * limit, (page - 1) * limit + limit);

  return res.json({
    items: pageItems.map(toListItem),
    page,
    totalPages: Math.max(Math.ceil(total / limit), 1),
    total,
    searchScanCapped: candidates.length === MAX_SEARCH_SCAN,
  });
}

// Per-service (+ overall) totals and new-enquiry counts for the module's
// service navigation. Always computed from the full collection on the
// backend — never derived from whatever page of results the frontend
// happens to currently have loaded.
export async function getServiceEnquiryCountsAdmin(req, res) {
  const rows = await ServiceEnquiry.aggregate([
    { $group: { _id: { service: "$serviceSlug", status: "$status" }, count: { $sum: 1 } } },
  ]);

  const byService = {};
  for (const slug of KNOWN_SERVICE_SLUGS) {
    byService[slug] = { total: 0, new: 0 };
  }
  const overall = { total: 0, new: 0 };

  for (const row of rows) {
    const slug = row._id.service;
    const status = row._id.status;
    const count = row.count;
    overall.total += count;
    if (status === "new") overall.new += count;
    if (byService[slug]) {
      byService[slug].total += count;
      if (status === "new") byService[slug].new += count;
    }
  }

  return res.json({ overall, byService });
}

// Full authorized detail — the only endpoint that ever returns a
// complete phone number or full message text.
export async function getServiceEnquiryAdmin(req, res) {
  const doc = await ServiceEnquiry.findById(req.params.id).lean();
  if (!doc) {
    return res.status(404).json({ message: "Enquiry not found." });
  }

  return res.json({
    id: doc._id,
    serviceSlug: doc.serviceSlug,
    serviceTitle: doc.serviceTitle,
    name: decryptField(doc.encryptedName),
    phone: decryptField(doc.encryptedPhone),
    email: decryptField(doc.encryptedEmail),
    address: decryptField(doc.encryptedAddress),
    message: decryptField(doc.encryptedMessage),
    consent: doc.consent,
    requestedAt: doc.requestedAt,
    status: doc.status,
    assignedTo: doc.assignedTo || null,
  });
}

export async function getServiceEnquiryHistoryAdmin(req, res) {
  const exists = await ServiceEnquiry.exists({ _id: req.params.id });
  if (!exists) {
    return res.status(404).json({ message: "Enquiry not found." });
  }

  const logs = await AuditLog.find({ serviceEnquiry: req.params.id })
    .sort({ createdAt: -1 })
    .populate("performedBy", "name email");

  return res.json(logs);
}

export async function updateServiceEnquiryStatusAdmin(req, res) {
  const { status } = req.body || {};
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  const enquiry = await ServiceEnquiry.findById(req.params.id);
  if (!enquiry) {
    return res.status(404).json({ message: "Enquiry not found." });
  }

  const before = { status: enquiry.status };
  enquiry.status = status;
  await enquiry.save();

  await AuditLog.create({
    serviceEnquiry: enquiry._id,
    action: "status_updated",
    performedBy: req.user._id,
    ipAddress: req.ip,
    before,
    after: { status },
  });

  return res.json({ id: enquiry._id, status: enquiry.status });
}

const EMAIL_SUBJECT_MAX = 200;

// Shallow shape returned for the "who's currently sending?" info shown
// to a second employee, whether that's via the 409 conflict body or the
// standalone "active operation" check endpoint below. Never exposes the
// email content — just enough for the UI to say e.g. "Started by Rahul,
// 7:42 PM."
function toActiveOperationInfo(op) {
  if (!op) return null;
  return {
    id: op._id,
    status: op.status,
    subject: op.subject,
    claimedBy: op.claimedBy
      ? { id: op.claimedBy._id, name: op.claimedBy.name || op.claimedBy.email }
      : null,
    claimedAt: op.claimedAt,
    createdAt: op.createdAt,
  };
}

// Lets the UI check, BEFORE a staff member even opens the composer,
// whether someone else is already mid-send on this enquiry — so the
// Send button can be disabled proactively instead of only failing at
// submit time. This is a convenience layer only; it is never the actual
// guard (see the atomic claim in sendServiceEnquiryEmailAdmin), because
// whatever this returns can already be stale by the time the UI renders
// it.
export async function getActiveServiceEnquiryEmailOperationAdmin(req, res) {
  const enquiry = await ServiceEnquiry.findById(req.params.id)
    .select("activeEmailOperation")
    .lean();
  if (!enquiry) {
    return res.status(404).json({ message: "Enquiry not found." });
  }

  if (!enquiry.activeEmailOperation) {
    return res.json({ active: null });
  }

  const op = await ServiceEnquiryEmail.findById(enquiry.activeEmailOperation).populate(
    "claimedBy",
    "name email"
  );

  return res.json({ active: toActiveOperationInfo(op) });
}

// Sends a customer email through the project's existing mailer, from
// content composed by staff in the Tiptap-based email composer. The
// recipient address always comes from the enquiry's own decrypted
// email — a `to`/recipient value in the request body, if any, is
// ignored, so this endpoint can never be used to email an arbitrary
// address using this mailbox's credentials.
//
// ----------------------------------------------------------------------
// Concurrency model (replaces the old emailSendLockedAt timeout)
// ----------------------------------------------------------------------
// Two employees can have this same enquiry open at once, so a single
// "disable the button while sending" client-side guard is not enough —
// it does nothing about a second browser tab, a different employee
// entirely, or a retried request. Layered protection, in order:
//
//  1. Idempotency key (per compose attempt, generated client-side). If
//     this exact request has already been recorded, we return its
//     existing result instead of creating a second operation — this is
//     what makes a browser retry after a timeout safe.
//  2. Atomic enquiry-level claim. `ServiceEnquiry.activeEmailOperation`
//     can only be set by a findOneAndUpdate matched on it being null —
//     if two requests race, only one can ever win, and the loser gets a
//     409 with who currently holds it.
//  3. Persistent operation state (QUEUED -> SENDING -> SENT / FAILED /
//     UNKNOWN). Not a timeout: the enquiry stays claimed until the
//     operation reaches a state that's actually safe to release from —
//     UNKNOWN is deliberately NOT auto-released (see below).
export async function sendServiceEnquiryEmailAdmin(req, res) {
  const enquiryId = req.params.id;
  const subject = typeof req.body?.subject === "string" ? req.body.subject.trim() : "";
  const body = req.body?.body;
  // The frontend generates one UUID per compose attempt and reuses it
  // across any automatic/manual retry of that same attempt (see
  // EmailComposer.jsx). A header is preferred (REST convention for
  // idempotency keys), but the body field is also accepted so this
  // endpoint degrades gracefully for any caller that can't set custom
  // headers. If neither is present we generate one server-side so the
  // request still succeeds — but note that only a client-supplied key
  // survives a lost-response browser retry, since a server-generated key
  // is different on every attempt.
  const idempotencyKey =
    (typeof req.get("Idempotency-Key") === "string" && req.get("Idempotency-Key").trim()) ||
    (typeof req.body?.idempotencyKey === "string" && req.body.idempotencyKey.trim()) ||
    crypto.randomUUID();

  if (!subject || subject.length > EMAIL_SUBJECT_MAX) {
    return res.status(400).json({ message: "Please provide a valid subject line." });
  }

  let rendered;
  try {
    rendered = renderTiptapEmail(body);
  } catch (err) {
    return res.status(400).json({ message: err.message || "Invalid email content." });
  }

  const enquiryDoc = await ServiceEnquiry.findById(enquiryId).select("encryptedEmail");
  if (!enquiryDoc) {
    return res.status(404).json({ message: "Enquiry not found." });
  }
  const recipientEmail = decryptField(enquiryDoc.encryptedEmail);

  // --- Layer 1: idempotency replay -----------------------------------
  // If this exact attempt was already recorded, never send twice for
  // it — just report the existing (possibly still in-flight) result.
  const existing = await ServiceEnquiryEmail.findOne({ idempotencyKey });
  if (existing) {
    return respondWithOperationResult(res, existing, { replay: true });
  }

  let operation;
  try {
    operation = await ServiceEnquiryEmail.create({
      enquiry: enquiryId,
      idempotencyKey,
      to: recipientEmail,
      subject,
      bodyJson: body,
      html: rendered.html,
      text: rendered.text,
      status: "QUEUED",
      createdBy: req.user._id,
    });
  } catch (err) {
    // Unique-index race: another request created a row with this exact
    // idempotency key between our findOne above and this create() — an
    // extremely narrow window, but handled the same way as a normal
    // replay rather than surfacing a raw duplicate-key 500.
    if (err?.code === 11000) {
      const winner = await ServiceEnquiryEmail.findOne({ idempotencyKey });
      if (winner) return respondWithOperationResult(res, winner, { replay: true });
    }
    throw err;
  }

  // --- Layer 2: atomic enquiry-level claim -----------------------------
  const claimedEnquiry = await ServiceEnquiry.findOneAndUpdate(
    { _id: enquiryId, activeEmailOperation: null },
    { $set: { activeEmailOperation: operation._id } }
  );

  if (!claimedEnquiry) {
    // Someone else already has an active operation on this enquiry. This
    // attempt never got to send anything, so there's no reason to keep
    // its record around — remove it rather than leaving an orphaned
    // QUEUED row that never ran.
    await ServiceEnquiryEmail.deleteOne({ _id: operation._id });

    const currentEnquiryState = await ServiceEnquiry.findById(enquiryId).select(
      "activeEmailOperation"
    );
    const active = currentEnquiryState?.activeEmailOperation
      ? await ServiceEnquiryEmail.findById(currentEnquiryState.activeEmailOperation).populate(
          "claimedBy",
          "name email"
        )
      : null;

    return res.status(409).json({
      message: "Another team member is currently sending an email for this enquiry.",
      activeOperation: toActiveOperationInfo(active),
    });
  }

  // --- Layer 3: send, then resolve to a terminal, persistent state ----
  operation.status = "SENDING";
  operation.claimedBy = req.user._id;
  operation.claimedAt = new Date();
  await operation.save();

  let outcome; // "SENT" | "FAILED" | "UNKNOWN"
  let providerMessageId = null;
  let errorMessage = null;

  try {
    const result = await sendMail({
      to: recipientEmail,
      subject,
      html: rendered.html,
      text: rendered.text,
    });
    outcome = "SENT";
    providerMessageId = result?.providerMessageId || null;
  } catch (err) {
    errorMessage = err?.message || "Unknown mail error.";
    // MailUncertainError means the connection dropped before we could
    // confirm the provider's decision — we must NOT assume failure (that
    // would license an automatic retry, which is exactly how a customer
    // ends up with a duplicate email). Anything else (MailRejectedError
    // or any other thrown error) means the provider explicitly rejected
    // the request, or we never got as far as calling it — a confident,
    // safe-to-retry failure.
    outcome = err instanceof MailUncertainError ? "UNKNOWN" : "FAILED";
  }

  operation.status = outcome;
  if (outcome === "SENT") {
    operation.sentAt = new Date();
    operation.providerMessageId = providerMessageId;
  } else {
    operation.failedAt = new Date();
    operation.error = errorMessage;
  }
  await operation.save();

  // Release the enquiry-level claim ONLY when it's actually safe to let
  // a new operation be claimed. SENT and FAILED are both terminal in a
  // way we're confident about. UNKNOWN is deliberately excluded — the
  // enquiry stays claimed (no new send can start) until an authorized
  // staff member reviews and resolves it (see
  // resolveServiceEnquiryEmailOperationAdmin).
  if (RELEASABLE_STATUSES.includes(outcome)) {
    await ServiceEnquiry.updateOne(
      { _id: enquiryId, activeEmailOperation: operation._id },
      { $set: { activeEmailOperation: null } }
    );
  }

  // Audit logging is a secondary, best-effort record of the outcome
  // already decided above — if this throws, a successfully-sent email
  // must still be reported to staff as sent, not surfaced as a 500 that
  // invites a duplicate resend.
  try {
    await AuditLog.create({
      serviceEnquiry: enquiryId,
      action:
        outcome === "SENT"
          ? "email_sent"
          : outcome === "UNKNOWN"
            ? "email_send_unknown"
            : "email_send_failed",
      performedBy: req.user._id,
      ipAddress: req.ip,
      after: {
        subject,
        recipient: recipientEmail,
        bodyJson: body,
        status: outcome.toLowerCase(),
        operationId: operation._id,
      },
    });
  } catch (auditErr) {
    console.error(`AuditLog.create failed for enquiry ${enquiryId} email send:`, auditErr);
  }

  return respondWithOperationResult(res, operation);
}

// Shared by both the fresh-send path and the idempotency-replay path so
// a retried request gets exactly the same response shape as the
// original.
function respondWithOperationResult(res, operation, { replay = false } = {}) {
  const replayNote = replay ? " (already recorded — not sent again)" : "";
  switch (operation.status) {
    case "SENT":
      return res.json({
        message: `Email sent.${replayNote}`,
        status: "SENT",
        providerMessageId: operation.providerMessageId || null,
      });
    case "FAILED":
      return res.status(502).json({
        message: `Could not send the email. Please try again.${replayNote}`,
        status: "FAILED",
      });
    case "UNKNOWN":
      // Deliberately not a 5xx: the request itself was handled
      // correctly by our server. It's the delivery outcome, not this
      // API call, that's uncertain.
      return res.status(202).json({
        message:
          "We couldn't confirm whether this email was delivered. It's on hold until a supervisor reviews it — please don't resend.",
        status: "UNKNOWN",
      });
    case "QUEUED":
    case "SENDING":
    default:
      return res.status(202).json({
        message: "This email is still being sent. Please wait.",
        status: operation.status,
      });
  }
}

// Manual recovery for an UNKNOWN operation — the one place the system
// allows a human, rather than any automatic process, to decide what
// happens next. `resolution` is either:
//   "did_not_send" -> we conclude the provider never actually sent it;
//                     mark FAILED (safe to retry with a new send) and
//                     release the enquiry so a new attempt can be made.
//   "did_send"     -> staff confirmed (e.g. checked the provider's own
//                     dashboard/logs) that it WAS delivered; mark SENT
//                     so the history is accurate and release the
//                     enquiry.
// Either way, the enquiry's activeEmailOperation is cleared here — this
// is the ONLY code path that releases an UNKNOWN operation.
export async function resolveServiceEnquiryEmailOperationAdmin(req, res) {
  const { id: enquiryId, emailId } = req.params;
  const { resolution, note } = req.body || {};

  if (!["did_send", "did_not_send"].includes(resolution)) {
    return res.status(400).json({
      message: 'Please specify a resolution: "did_send" or "did_not_send".',
    });
  }

  const operation = await ServiceEnquiryEmail.findOne({ _id: emailId, enquiry: enquiryId });
  if (!operation) {
    return res.status(404).json({ message: "Email operation not found." });
  }
  if (operation.status !== "UNKNOWN") {
    return res.status(409).json({
      message: `This operation is already ${operation.status.toLowerCase()} and does not need resolving.`,
    });
  }

  operation.status = resolution === "did_send" ? "SENT" : "FAILED";
  if (operation.status === "SENT") {
    operation.sentAt = operation.sentAt || new Date();
  } else {
    operation.failedAt = operation.failedAt || new Date();
  }
  operation.resolvedBy = req.user._id;
  operation.resolvedAt = new Date();
  operation.resolutionNote = typeof note === "string" ? note.trim().slice(0, 500) : null;
  await operation.save();

  await ServiceEnquiry.updateOne(
    { _id: enquiryId, activeEmailOperation: operation._id },
    { $set: { activeEmailOperation: null } }
  );

  await AuditLog.create({
    serviceEnquiry: enquiryId,
    action: "email_operation_resolved",
    performedBy: req.user._id,
    ipAddress: req.ip,
    before: { status: "UNKNOWN" },
    after: { status: operation.status, resolution, note: operation.resolutionNote, operationId: operation._id },
  });

  return res.json({ id: operation._id, status: operation.status });
}
