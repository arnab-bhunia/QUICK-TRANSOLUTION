import mongoose from "mongoose";

// ============================================================================
// JOB
// A single job opening. Mirrors the Blog model's slug/status/publishedAt
// conventions (see models/Blog.js) since both are "content that goes
// public on a schedule and gets managed from an admin CMS panel" —
// same shape of problem, same solution.
//
// Nothing sensitive lives on this model (no applicant PII) — that's
// JobApplication's job. This is purely the posting itself.
// ============================================================================

// Configurable, job-specific application questions. Never hard-coded on
// the frontend — HR defines these per job (see section 3 of the spec).
// `id` is a short stable string (not a Mongo ObjectId) so it reads
// cleanly inside a JobApplication's answer snapshot even after the Job
// document — or this specific question — is later edited or removed.
const applicationQuestionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true, maxlength: 40 },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    type: {
      type: String,
      enum: ["short_text", "long_text", "single_choice", "multiple_choice", "yes_no"],
      required: true,
    },
    required: { type: Boolean, default: false },
    // Only meaningful for single_choice / multiple_choice.
    options: { type: [String], default: [] },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const salarySchema = new mongoose.Schema(
  {
    configured: { type: Boolean, default: false },
    min: { type: Number, default: null },
    max: { type: Number, default: null },
    currency: { type: String, trim: true, default: "INR" },
    period: {
      type: String,
      enum: ["yearly", "monthly"],
      default: "yearly",
    },
    // Free-text override, e.g. "Competitive, based on experience" — used
    // instead of/alongside the numeric range when HR doesn't want to
    // publish exact figures.
    note: { type: String, trim: true, maxlength: 200, default: "" },
  },
  { _id: false }
);

export const JOB_STATUSES = ["DRAFT", "OPEN", "CLOSED", "ARCHIVED"];

export const QUESTION_TYPES = [
  "short_text",
  "long_text",
  "single_choice",
  "multiple_choice",
  "yes_no",
];

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    // Same rationale as Blog.previousSlugs — an already-shared/indexed
    // job URL keeps resolving after a title edit changes the slug.
    previousSlugs: { type: [String], default: [] },

    department: { type: String, required: true, trim: true, maxlength: 100 },
    employmentType: {
      type: String,
      required: true,
      enum: ["full_time", "part_time", "contract", "internship", "temporary"],
    },
    location: { type: String, required: true, trim: true, maxlength: 160 },
    workMode: {
      type: String,
      required: true,
      enum: ["on_site", "remote", "hybrid"],
    },
    experience: {
      // Free text (e.g. "2-4 years") — deliberately not numeric-only, so
      // HR can write "Fresher" / "5+ years" / "2-4 years" naturally.
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },

    salary: { type: salarySchema, default: () => ({}) },

    shortDescription: { type: String, trim: true, maxlength: 300, default: "" },
    description: { type: String, trim: true, default: "" },

    responsibilities: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    preferredQualifications: { type: [String], default: [] },
    benefits: { type: [String], default: [] },

    applicationQuestions: { type: [applicationQuestionSchema], default: [] },

    status: { type: String, enum: JOB_STATUSES, default: "DRAFT" },

    // Set automatically by the backend the moment status transitions to
    // OPEN — never accepted from the client (see jobController.js).
    publishedAt: { type: Date, default: null },

    // HR-configured — may be in the future. Publicly enforced server-side
    // on both the listing/detail visibility AND the application endpoint
    // (see jobController.js / jobApplicationController.js), never
    // trusted to the frontend alone.
    closingDate: { type: Date, default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", default: null },
  },
  { timestamps: true }
);

// Every public listing/detail query filters by status + closingDate and
// sorts by publishedAt — matches the Blog model's indexing rationale.
jobSchema.index({ status: 1, publishedAt: -1 });
jobSchema.index({ status: 1, closingDate: 1 });
jobSchema.index({ department: 1, status: 1 });
jobSchema.index({ previousSlugs: 1 });
jobSchema.index({ title: "text", department: "text", shortDescription: "text" });

// A job is a live, applyable public opportunity only while it is OPEN
// AND (no closing date OR that date hasn't passed yet). Centralized
// here so the public listing, the public detail page, and the
// application-submission guard all share exactly one definition instead
// of three copies that could drift out of sync.
jobSchema.methods.isOpenForApplications = function isOpenForApplications(now = new Date()) {
  if (this.status !== "OPEN") return false;
  if (this.closingDate && this.closingDate.getTime() < now.getTime()) return false;
  return true;
};

export default mongoose.model("Job", jobSchema);
