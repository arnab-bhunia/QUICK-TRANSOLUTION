import mongoose from "mongoose";

// ============================================================================
// SERVICE ENQUIRY
// One document per "Enquire Now" submission from a service detail page.
// Name/phone/email/address/message are stored ENCRYPTED (see utils/crypto.js)
// — never stored or logged in plaintext. emailHash is a one-way lookup hash
// so staff can find a record by email without decrypting the collection.
// ============================================================================

const consentSchema = new mongoose.Schema(
  {
    acceptedPrivacyPolicy: { type: Boolean, required: true },
    acceptedTermsOfService: { type: Boolean, required: true },
    // Deliberately the same instant as `requestedAt` on the parent
    // document — the user accepted the policies at the moment they hit
    // submit, not at some other time.
    acceptedAt: { type: Date, required: true },
  },
  { _id: false }
);

const serviceEnquirySchema = new mongoose.Schema(
  {
    serviceSlug: { type: String, required: true, trim: true, maxlength: 60 },
    serviceTitle: { type: String, required: true, trim: true, maxlength: 120 },

    // Linked automatically server-side if the submitter has a valid
    // session cookie — never trusted from the request body.
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },

    encryptedName: { type: String, required: true },
    encryptedPhone: { type: String, required: true },
    encryptedEmail: { type: String, required: true },
    encryptedAddress: { type: String, required: true },
    encryptedMessage: { type: String, required: true },

    emailHash: { type: String, index: true },

    consent: { type: consentSchema, required: true },
    requestedAt: { type: Date, required: true, default: Date.now },

    ipAddress: { type: String },
    userAgent: { type: String, maxlength: 300 },

    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

serviceEnquirySchema.index({ createdAt: -1 });

export default mongoose.model("ServiceEnquiry", serviceEnquirySchema);
