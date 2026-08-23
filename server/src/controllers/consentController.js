import ConsentRecord from "../models/ConsentRecord.js";
import Customer from "../models/Customer.js";
import { verifyToken, CLIENT_COOKIE_NAME } from "../utils/jwt.js";

const VISITOR_ID_REGEX = /^[a-zA-Z0-9-]{10,64}$/;

// Best-effort: if a valid customer session cookie is present, link this
// consent record to their account. Never blocks or errors if absent/
// invalid — consent must work for anonymous visitors regardless.
async function tryResolveCustomerId(req) {
  const token = req.cookies?.[CLIENT_COOKIE_NAME];
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    if (payload.type !== "customer") return null;
    const customer = await Customer.exists({ _id: payload.sub });
    return customer ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function saveConsent(req, res) {
  const { visitorId, categories, policyVersion } = req.body;

  if (typeof visitorId !== "string" || !VISITOR_ID_REGEX.test(visitorId)) {
    return res.status(400).json({ message: "Invalid visitor ID" });
  }
  if (!policyVersion?.trim()) {
    return res.status(400).json({ message: "Policy version is required" });
  }

  const customerId = await tryResolveCustomerId(req);

  const record = await ConsentRecord.findOneAndUpdate(
    { visitorId },
    {
      visitorId,
      customer: customerId,
      categories: {
        necessary: true, // never optional
        analytics: Boolean(categories?.analytics),
        marketing: Boolean(categories?.marketing),
      },
      policyVersion: policyVersion.trim(),
      ipAddress: req.ip,
      userAgent: req.get("user-agent") || "",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json({
    visitorId: record.visitorId,
    categories: record.categories,
    policyVersion: record.policyVersion,
  });
}
