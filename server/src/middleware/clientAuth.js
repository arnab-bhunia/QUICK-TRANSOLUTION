import { verifyToken, CLIENT_COOKIE_NAME } from "../utils/jwt.js";
import Customer from "../models/Customer.js";
import { cacheGet, cacheSet } from "../config/redis.js";

// This is the exact "GET /api/client/me on every page load" check
// discussed earlier — the highest-frequency authenticated lookup on
// the whole site, so it's the one most worth caching.
const CUSTOMER_CACHE_TTL = 300;

export async function requireClientAuth(req, res, next) {
  const token = req.cookies?.[CLIENT_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ message: "Please sign in to continue" });
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return res.status(401).json({ message: "Session expired, please sign in again" });
  }

  if (payload.type !== "customer") {
    return res.status(401).json({ message: "Please sign in to continue" });
  }

  const cacheKey = `customer:${payload.sub}`;
  let customer = await cacheGet(cacheKey);

  if (!customer) {
    customer = await Customer.findById(payload.sub).select("-passwordHash").lean();
    if (!customer) {
      return res.status(401).json({ message: "Please sign in to continue" });
    }
    await cacheSet(cacheKey, customer, CUSTOMER_CACHE_TTL);
  }

  req.customer = customer;
  next();
}