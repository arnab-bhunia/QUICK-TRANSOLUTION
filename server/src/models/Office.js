import mongoose from "mongoose";

// ============================================================================
// OFFICE
// MongoDB is the single source of truth for offices. `code` is the same
// identifier AdminUser.officeCode already stores (e.g. "OFQT615904"), so no
// employee record ever needs rewriting. It is generated server-side for new
// offices (see utils/officeId.js) and is immutable once created.
//
// Offices are never deleted — only deactivated — so historical employee
// assignments always keep resolving to a name.
// ============================================================================

const officeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      immutable: true, // Mongoose ignores any later attempt to change it
      trim: true,
      uppercase: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    address: { type: String, trim: true, maxlength: 300, default: "" },
    city: { type: String, trim: true, maxlength: 100, default: "" },
    state: { type: String, trim: true, maxlength: 100, default: "" },
    country: { type: String, trim: true, maxlength: 100, default: "" },
    phone: { type: String, trim: true, maxlength: 30, default: "" },
    email: { type: String, trim: true, lowercase: true, maxlength: 254, default: "" },
    isActive: { type: Boolean, default: true, index: true },

    // Audit trail: which admin created / last changed this office. Always
    // set server-side from the authenticated user, never from the request
    // body. Null for the legacy offices migrated by the seed script.
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", default: null, immutable: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", default: null },

    // Current deactivation state. Set atomically with the status change and
    // cleared on reactivation; permanent history lives in statusHistory.
    deactivatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", default: null },
    deactivatedAt: { type: Date, default: null },

    // Append-only audit trail of successful status transitions. Entries are
    // only ever added by the single-document atomic updates in
    // utils/officeAssignment.js (deactivate) and officeController.js
    // (reactivate) — in the SAME update that changes isActive, so an event
    // exists if and only if the transition committed, with or without
    // transactions. Never edited or removed; no API accepts these fields.
    statusHistory: {
      type: [
        new mongoose.Schema(
          {
            officeCode: { type: String, required: true },
            type: { type: String, enum: ["DEACTIVATED", "REACTIVATED"], required: true },
            by: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", required: true },
            at: { type: Date, required: true },
          },
          { _id: false }
        ),
      ],
      default: [],
    },

    // Internal coordination fields used by utils/officeAssignment.js to keep
    // "no deactivation while accounts are assigned" safe under concurrency.
    // Never returned by the API.
    assignmentVersion: { type: Number, default: 0 }, // transaction mode: forces write-write conflicts
    pendingAssignments: { type: Number, default: 0 }, // gate mode: in-flight assignment reservations
    deactivationToken: { type: String, default: null }, // gate mode: fencing token of the deactivation lock
    deactivationStartedAt: { type: Date, default: null }, // gate mode: when that lock was taken (liveness only)
  },
  { timestamps: true }
);

// Case-insensitive unique name, so "delhi" and "Delhi" can't both exist.
officeSchema.index({ name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

export default mongoose.model("Office", officeSchema);
