import mongoose from "mongoose";

// ============================================================================
// JOB APPLICATION
// One document per candidate submission. Sensitive applicant information
// is stored ENCRYPTED, exactly like ServiceEnquiry (see utils/crypto.js
// and models/ServiceEnquiry.js) — never in plaintext.
//
// No candidate account/login is required to create one of these (see
// section 2/19 of the spec) — the only identity involved is:
//   - a best-effort client session (visitorId cookie) for abuse
//     protection, never trusted as identity;
//   - emailHash for exact-match lookup without decrypting the collection;
//   - the applicationId as the durable, candidate-facing reference.
// This deliberately leaves room for a future Candidate entity to sit on
// top without requiring a rewrite of this model (see FUTURE ATS note
// near the bottom of the schema).
// ============================================================================

const consentSchema = new mongoose.Schema(
  {
    accepted: { type: Boolean, required: true },
    policyVersion: { type: String, required: true, trim: true },
    // Always generated server-side (see jobApplicationController.js) —
    // never trusted from the client, exactly as required by the spec.
    acceptedAt: { type: Date, required: true },
  },
  { _id: false }
);

// A snapshot of the question as it existed AT SUBMISSION TIME, plus the
// applicant's answer. Storing the question text/type alongside the
// answer (not just a questionId FK into Job.applicationQuestions) means
// this record stays correct and readable forever even if the job's
// questions are later edited, reordered, or deleted entirely.
const questionAnswerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true, trim: true },
    questionText: { type: String, required: true, trim: true },
    questionType: {
      type: String,
      enum: ["short_text", "long_text", "single_choice", "multiple_choice", "yes_no"],
      required: true,
    },
    // Mixed because the shape varies by questionType: a String for
    // short_text/long_text/single_choice/yes_no, a [String] for
    // multiple_choice. Validated at the controller level against the
    // job's question definitions at submission time — this field just
    // needs to faithfully store whatever passed that validation.
    answer: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    originalFileName: { type: String, trim: true, maxlength: 255 },
    // Cloudinary public_id of the PRIVATE upload — never a public URL.
    // See utils/storage.js uploadToCloudinary({ type: "private" }) and
    // jobApplicationController.js getApplicationResumeAdmin, the only
    // route that ever turns this into a short-lived signed link.
    storageKey: { type: String, required: true },
    mimeType: { type: String, trim: true, default: "application/pdf" },
    size: { type: Number }, // bytes
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const timelineEntrySchema = new mongoose.Schema(
  {
    event: { type: String, required: true, trim: true },
    detail: { type: String, trim: true, default: "" },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", default: null },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const internalNoteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

export const APPLICATION_STATUSES = [
  "NEW",
  "REVIEWING",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "REJECTED",
  "WITHDRAWN",
];

const jobApplicationSchema = new mongoose.Schema(
  {
    applicationId: { type: String, required: true, unique: true, index: true }, // QT-APP-2026-000124

    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    // Denormalized so the title/slug at time of application stays
    // readable/searchable even if the Job is later renamed or archived.
    jobTitleSnapshot: { type: String, trim: true, maxlength: 160 },
    jobSlugSnapshot: { type: String, trim: true, maxlength: 160 },

    // --- Encrypted applicant PII (see utils/crypto.js) ---
    encryptedName: { type: String, required: true },
    encryptedEmail: { type: String, required: true },
    encryptedPhone: { type: String, required: true },
    encryptedLocation: { type: String, required: true },
    encryptedCurrentRole: { type: String, default: null },
    encryptedExpectedSalary: { type: String, default: null },
    encryptedCoverLetter: { type: String, default: null },

    emailHash: { type: String, index: true },

    // --- Operational / queryable fields (never encrypted) ---
    experience: { type: String, trim: true, maxlength: 60, default: "" },
    noticePeriod: { type: String, trim: true, maxlength: 60, default: "" },
    linkedin: { type: String, trim: true, maxlength: 300, default: "" },
    github: { type: String, trim: true, maxlength: 300, default: "" },
    portfolio: { type: String, trim: true, maxlength: 300, default: "" },

    resume: { type: resumeSchema, required: true },

    answers: { type: [questionAnswerSchema], default: [] },

    status: { type: String, enum: APPLICATION_STATUSES, default: "NEW" },

    source: { type: String, trim: true, default: "website" },

    consent: { type: consentSchema, required: true },

    // Best-effort client session id (see client/src/utils/visitorId.js) —
    // used ONLY for duplicate/abuse mitigation, never as identity.
    sessionId: { type: String, trim: true, default: null, index: true },
    ipAddress: { type: String, trim: true, default: "" },
    userAgent: { type: String, trim: true, maxlength: 300, default: "" },

    internalNotes: { type: [internalNoteSchema], default: [] },
    timeline: { type: [timelineEntrySchema], default: [] },

    // FUTURE ATS COMPATIBILITY
    // Intentionally present but unused in V1 — lets a future Candidate
    // entity attach to existing applications without a schema
    // migration (see spec section 19).
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", default: null },
  },
  { timestamps: true }
);

jobApplicationSchema.index({ createdAt: -1 });
jobApplicationSchema.index({ job: 1, status: 1 });
jobApplicationSchema.index({ job: 1, createdAt: -1 });

// SAME-JOB DUPLICATE PROTECTION (spec: Careers V1 hardening, section 10/11)
// A compound UNIQUE index — not an application-level findOne()+create()
// check — because uniqueness has to be enforced atomically at the
// database level to survive two concurrent submissions for the same
// email+job landing at (almost) the same instant. MongoDB itself
// rejects the second insert with a duplicate-key error (E11000);
// jobApplicationController.js's submitJobApplication() catches that
// and turns it into the candidate-facing "already applied" message —
// see the comment there for the full flow (a fast findOne() pre-check
// for the common, non-racing case, PLUS this index as the actual
// safety net).
//
// Deliberately {emailHash, job} and NOT just {emailHash} — the same
// candidate must remain free to apply to as many different jobs as
// they like; only a second submission to the SAME job is a duplicate.
// This also keeps `job` as the only "identity" concept in play,
// which is exactly what a future Candidate entity would want to slot
// underneath later (see spec section 19 / the "FUTURE ATS
// COMPATIBILITY" note above) — this index doesn't hard-code any
// assumption that needs undoing when that entity arrives.
jobApplicationSchema.index({ emailHash: 1, job: 1 }, { unique: true });

export default mongoose.model("JobApplication", jobApplicationSchema);
