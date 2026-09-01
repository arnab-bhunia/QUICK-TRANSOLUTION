import mongoose from "mongoose";
import { OFFICE_CODES } from "../config/offices.js";

// ============================================================================
// ADMIN / STAFF USER
// mobileNumber is PII — stored ENCRYPTED (see utils/crypto.js), same pattern
// used for customer-facing PII elsewhere in this codebase. mobileHash is a
// one-way lookup hash so we can enforce "one account per mobile number"
// and search by number without ever decrypting the whole collection.
// ============================================================================

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const adminUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "hr", "manager", "staff", "content_writer"],
      default: "staff",
    },

    // Who created/supervises this account. For a "staff" account this IS
    // the reporting manager (used to scope a manager's own view/creation
    // rights to only their own people — see config/permissions.js and
    // adminController.js). For every other role it's kept purely as an
    // audit trail of who onboarded them.
    managedBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", default: null },

    // Account-specific permissions ON TOP OF the role's defaults.
    // Empty for every account today — reserved for a future "grant this
    // specific person an extra permission" admin screen.
    extraPermissions: { type: [String], default: [] },

    // Encrypted at rest — see utils/crypto.js encryptField/decryptField.
    // Never store or log the plaintext mobile number anywhere else.
    encryptedMobile: { type: String, required: true },
    mobileHash: { type: String, required: true, unique: true },

    dob: { type: Date, required: true },

    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      default: null,
    },

    // Office is stored as a single column holding one of the known office
    // codes from config/offices.js — never a free-text location.
    officeCode: {
      type: String,
      required: true,
      enum: OFFICE_CODES,
    },

    // Forces a password change on first login. Always true for new
    // accounts, and especially important when the temp password was
    // generated from the staff member's own DOB (predictable/guessable),
    // so the account can't be left on a weak, easily-guessed password.
    mustChangePassword: { type: Boolean, default: true },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export { BLOOD_GROUPS };
export default mongoose.model("AdminUser", adminUserSchema);
