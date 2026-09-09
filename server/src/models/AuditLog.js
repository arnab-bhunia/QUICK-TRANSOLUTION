import mongoose from "mongoose";

// Append-only by convention: no route in this codebase ever calls
// AuditLog.updateOne / deleteOne / findOneAndUpdate — only .create() and
// reads. This collection is never returned from a public route.
//
// Shared across subsystems rather than forking a second logging model
// per feature — a record sets EITHER `shipment` OR `serviceEnquiry`
// (never both), and `action` is a single enum covering every
// subsystem's events. Adding a third subsystem later means adding one
// more optional ref field + a couple of enum values here, not a new
// collection.
const auditLogSchema = new mongoose.Schema(
  {
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      index: true,
    },
    // Denormalized so the tracking ID is still readable in the audit
    // trail even if the Shipment document is ever deleted.
    trackingId: { type: String, trim: true },

    // Service Enquiry equivalent of `shipment` above — set on entries
    // created by the Service Enquiries admin module (status changes,
    // emails sent, the initial "created" event from the public form).
    serviceEnquiry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceEnquiry",
      index: true,
      default: null,
    },
    action: {
      type: String,
      enum: [
        "created",
        "status_updated",
        "visibility_changed",
        "lookup_failed",
        "viewed_private",
        "email_sent",
        "email_send_failed",
        // Delivery outcome could not be confirmed (see
        // ServiceEnquiryEmail's UNKNOWN status) — the enquiry stays
        // locked against new sends until a staff member resolves it.
        "email_send_unknown",
        // A staff member manually reviewed an "email_send_unknown"
        // operation and resolved it, one way or the other.
        "email_operation_resolved",
      ],
      required: true,
    },
    // null for actions taken by an anonymous visitor (e.g. a failed
    // public lookup) — only set for authenticated admin/staff actions.
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      default: null,
    },
    ipAddress: { type: String, trim: true, default: "" },
    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);