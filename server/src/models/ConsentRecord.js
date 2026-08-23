import mongoose from "mongoose";

// One record per visitor, updated (not duplicated) every time they
// change their choice — this IS the legal proof of consent: who
// consented, to what, when, and under which version of the policy.
const consentRecordSchema = new mongoose.Schema(
  {
    visitorId: { type: String, required: true, unique: true, trim: true },
    // Linked when the visitor happens to be a logged-in customer at the
    // time of consent — optional, since consent must work for anonymous
    // visitors too (most visitors decide before ever signing up).
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    categories: {
      necessary: { type: Boolean, default: true }, // always true — can't be declined
      analytics: { type: Boolean, default: false },
      marketing: { type: Boolean, default: false },
    },
    policyVersion: { type: String, required: true },
    ipAddress: { type: String, trim: true, default: "" },
    userAgent: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("ConsentRecord", consentRecordSchema);
