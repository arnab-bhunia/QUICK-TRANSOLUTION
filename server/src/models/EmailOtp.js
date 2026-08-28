import mongoose from "mongoose";

// ============================================================================
// EMAIL OTP
// Short-lived signup-verification codes. Never stores the OTP itself —
// only an HMAC hash of it (see utils/otp.js), same principle as password
// hashing: even a full database read never reveals a usable code.
//
// The TTL index below tells MongoDB to auto-delete a document once its
// `expiresAt` time has passed — no cron job or manual cleanup needed,
// expired codes just disappear on their own a short time after expiry.
// ============================================================================

const emailOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    otpHash: { type: String, required: true },
    purpose: { type: String, enum: ["signup"], default: "signup" },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// expireAfterSeconds: 0 means "expire exactly at the time stored in
// expiresAt" (not N seconds after creation) — MongoDB's background TTL
// job sweeps expired documents roughly once a minute.
emailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("EmailOtp", emailOtpSchema);
