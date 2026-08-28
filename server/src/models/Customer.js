import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: 254,
    },

    // Encrypted at rest (see utils/crypto.js). phoneHash is a one-way
    // HMAC lookup so staff/support tooling can search by phone number
    // without ever decrypting the whole collection — it is NOT used for
    // login (email + password remains the only login path).
    encryptedPhone: { type: String, required: true },
    phoneHash: { type: String, index: true },

    // "As per Aadhaar" fields — collected for KYC-style verification of
    // logistics customers, not just a generic profile.
    dob: { type: Date, required: true },
    industry: { type: String, trim: true, maxlength: 100, default: "" },

    passwordHash: { type: String, required: true },

    // Gates login until the signup email-OTP flow completes — see
    // controllers/clientAuthController.js and models/EmailOtp.js.
    emailVerified: { type: Boolean, default: false },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
