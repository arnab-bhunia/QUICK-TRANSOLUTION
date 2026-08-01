import mongoose from "mongoose";

// Append-only by convention: no route in this codebase ever calls
// AuditLog.updateOne / deleteOne / findOneAndUpdate — only .create() and
// reads. This collection is never returned from a public route.
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
    action: {
      type: String,
      enum: [
        "created",
        "status_updated",
        "visibility_changed",
        "lookup_failed",
        "viewed_private",
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
