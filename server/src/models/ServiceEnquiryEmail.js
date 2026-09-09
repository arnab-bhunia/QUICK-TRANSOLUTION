import mongoose from "mongoose";

// ============================================================================
// SERVICE ENQUIRY EMAIL — "email operation" record.
//
// This is the piece the old `emailSendLockedAt` timeout on ServiceEnquiry
// could never provide: a PERSISTENT, per-attempt record of every outbound
// email tied to an enquiry, independent of how long the send takes or
// whether the process that started it is still alive.
//
// Two employees can have the same enquiry open at once. The rule this
// collection enforces (together with ServiceEnquiry.activeEmailOperation,
// see that model) is:
//
//   At any moment, an enquiry can have only ONE active outbound email
//   operation — never "only one employee can click the button" and never
//   "locked for N minutes".
//
// Every attempt — successful, failed, or uncertain — stays here forever,
// so the enquiry's email history is always fully reconstructable.
// ============================================================================

// QUEUED   — operation created, not yet claimed by a worker.
// SENDING  — exactly one request/process owns this operation right now.
// SENT     — the provider confirmed acceptance. Terminal, safe.
// FAILED   — we know, with confidence, that the provider did NOT accept
//            the email (e.g. it rejected the request outright, or we
//            never got as far as a network call). Terminal, safe to
//            retry with a new operation.
// UNKNOWN  — we lost certainty (e.g. the connection died after the
//            request left our server but before we got a response).
//            Terminal for automatic purposes: the system must NEVER
//            auto-resend an UNKNOWN operation. It stays "active" (see
//            ServiceEnquiry.activeEmailOperation) until an authorized
//            staff member reviews it and manually resolves it.
export const EMAIL_OPERATION_STATUSES = ["QUEUED", "SENDING", "SENT", "FAILED", "UNKNOWN"];

// Statuses that make it safe to clear ServiceEnquiry.activeEmailOperation
// and allow a brand-new operation to be claimed. UNKNOWN is deliberately
// excluded — see the comment on that status above.
export const RELEASABLE_STATUSES = ["SENT", "FAILED"];

const serviceEnquiryEmailSchema = new mongoose.Schema(
  {
    enquiry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceEnquiry",
      required: true,
      index: true,
    },

    // Client-generated per-attempt key (see EmailComposer.jsx). Unique so
    // that a retried request — browser retry after a timeout, an
    // accidental double-submit, whatever — can never create a second
    // operation for the same logical attempt. The controller looks this
    // up FIRST, before doing anything else, and simply returns the
    // existing operation's result if it already exists.
    idempotencyKey: { type: String, required: true, unique: true, index: true },

    to: { type: String, required: true },
    subject: { type: String, required: true, maxlength: 200 },
    // Full Tiptap JSON, kept verbatim — same convention as
    // AuditLog.after.bodyJson today — so the exact content of every
    // attempt (not just the successful one) is recoverable.
    bodyJson: { type: mongoose.Schema.Types.Mixed },
    html: { type: String },
    text: { type: String },

    status: {
      type: String,
      enum: EMAIL_OPERATION_STATUSES,
      default: "QUEUED",
      index: true,
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", required: true },

    // Set at the moment this operation wins the atomic claim on the
    // parent enquiry (see ServiceEnquiryController). Used to answer
    // "who is currently sending this?" for the 409 response shown to a
    // second employee.
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", default: null },
    claimedAt: { type: Date, default: null },

    // Correlation id returned by the mail provider on acceptance (Brevo
    // messageId / SMTP messageId), stored permanently once known so the
    // internal record and the provider's own logs can be cross-referenced.
    providerMessageId: { type: String, default: null },

    sentAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
    // Set when the operation lands in UNKNOWN — the network/provider
    // error that made the outcome uncertain, kept for staff review.
    error: { type: String, default: null },

    // Populated only when a staff member manually resolves an UNKNOWN
    // operation (see resolveServiceEnquiryEmailOperationAdmin). Never set
    // by any automatic process — that's the whole point of UNKNOWN.
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", default: null },
    resolvedAt: { type: Date, default: null },
    resolutionNote: { type: String, maxlength: 500, default: null },
  },
  { timestamps: true }
);

serviceEnquiryEmailSchema.index({ enquiry: 1, createdAt: -1 });

export default mongoose.model("ServiceEnquiryEmail", serviceEnquiryEmailSchema);
