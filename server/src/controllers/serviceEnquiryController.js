import ServiceEnquiry from "../models/ServiceEnquiry.js";
import Customer from "../models/Customer.js";
import { verifyToken, CLIENT_COOKIE_NAME } from "../utils/jwt.js";
import { encryptField, decryptField, hashLookupValue } from "../utils/crypto.js";

// Mirrors the 6 ids in client/src/config/site.js. Kept as an allowlist
// (rather than just capping length) so this field can never carry
// arbitrary attacker-controlled text — it's used to power the "which
// service was this enquiry about" filter in the admin view.
const KNOWN_SERVICE_SLUGS = [
  "multimodal",
  "warehousing",
  "custom-clearance",
  "express-cargo",
  "supply-chain",
  "import-export",
];

// Hard server-side caps — the real enforcement point. The frontend's
// maxLength attributes are a UX nicety, not a security boundary; a
// request can always be sent directly to this endpoint bypassing the
// browser entirely, so every limit here is re-checked independent of
// whatever the client already did.
const LIMITS = {
  serviceTitle: 120,
  name: 100,
  phone: 20,
  email: 254,
  address: 300,
  message: 1500,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-()\s]{6,20}$/;

// Best-effort session check — unlike requireClientAuth, a missing or
// invalid cookie is NOT an error here. This endpoint is open to guests;
// we only use the cookie (when present and valid) to link the enquiry to
// an account, never to require one.
async function tryResolveCustomerId(req) {
  const token = req.cookies?.[CLIENT_COOKIE_NAME];
  if (!token) return null;

  try {
    const payload = verifyToken(token);
    if (payload.type !== "customer") return null;
    const exists = await Customer.exists({ _id: payload.sub });
    return exists ? payload.sub : null;
  } catch {
    return null; // expired/invalid token — treat exactly like a guest
  }
}

// Plain string check + length cap. Deliberately not a generic
// "sanitize-everything" regex replace: stripping characters from a
// person's name or address tends to mangle legitimate input (apostrophes,
// accents, etc). The actual injection defenses are (a) these fields are
// only ever used as encrypted string values, never interpolated into a
// query or a shell command, and (b) express-mongo-sanitize (already
// applied globally in app.js) strips any "$"/"." operator keys from the
// body before this controller ever sees it.
function cleanString(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export async function createServiceEnquiry(req, res) {
  const body = req.body || {};

  const serviceSlug = cleanString(body.serviceSlug, 60);
  if (!KNOWN_SERVICE_SLUGS.includes(serviceSlug)) {
    return res.status(400).json({ message: "Unknown service." });
  }

  const serviceTitle = cleanString(body.serviceTitle, LIMITS.serviceTitle);
  const name = cleanString(body.name, LIMITS.name);
  const phone = cleanString(body.phone, LIMITS.phone);
  const email = cleanString(body.email, LIMITS.email).toLowerCase();
  const address = cleanString(body.address, LIMITS.address);
  const message = cleanString(body.message, LIMITS.message);

  if (!serviceTitle || !name || !phone || !email || !address || !message) {
    return res.status(400).json({ message: "Please fill in all required fields." });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }
  if (!PHONE_RE.test(phone)) {
    return res.status(400).json({ message: "Please enter a valid phone number." });
  }
  // ~300-word cap on the free-text field, re-checked here independent of
  // the character cap above (a message can be under 1500 characters and
  // still be checked here; this just guards against extreme edge cases
  // like 1500 single-character "words" with no whitespace).
  if (message.split(/\s+/).filter(Boolean).length > 300) {
    return res.status(400).json({ message: "Please keep your message under 300 words." });
  }

  if (body.acceptedPrivacyPolicy !== true || body.acceptedTermsOfService !== true) {
    return res
      .status(400)
      .json({ message: "Please accept the Privacy Policy and Terms of Service." });
  }

  const customerId = await tryResolveCustomerId(req);
  const now = new Date();

  const enquiry = await ServiceEnquiry.create({
    serviceSlug,
    serviceTitle,
    customer: customerId,
    encryptedName: encryptField(name),
    encryptedPhone: encryptField(phone),
    encryptedEmail: encryptField(email),
    encryptedAddress: encryptField(address),
    encryptedMessage: encryptField(message),
    emailHash: hashLookupValue(email),
    consent: {
      acceptedPrivacyPolicy: true,
      acceptedTermsOfService: true,
      acceptedAt: now, // same instant as requestedAt, per the requirement
    },
    requestedAt: now,
    ipAddress: req.ip,
    userAgent: cleanString(req.get("user-agent"), 300),
  });

  return res.status(201).json({
    message: "Enquiry received.",
    id: enquiry._id,
  });
}

// --- Admin (staff) view ---
// Decrypts on the way out only for an authenticated staff member viewing
// the list — never logged, never returned to the public endpoint above.
export async function listServiceEnquiriesAdmin(req, res) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = 20;

  const [docs, total] = await Promise.all([
    ServiceEnquiry.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ServiceEnquiry.countDocuments(),
  ]);

  const items = docs.map((doc) => ({
    id: doc._id,
    serviceSlug: doc.serviceSlug,
    serviceTitle: doc.serviceTitle,
    customer: doc.customer,
    name: decryptField(doc.encryptedName),
    phone: decryptField(doc.encryptedPhone),
    email: decryptField(doc.encryptedEmail),
    address: decryptField(doc.encryptedAddress),
    message: decryptField(doc.encryptedMessage),
    consent: doc.consent,
    requestedAt: doc.requestedAt,
    status: doc.status,
  }));

  return res.json({ items, page, totalPages: Math.ceil(total / limit), total });
}
