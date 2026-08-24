import { verifyToken, COOKIE_NAME } from "../utils/jwt.js";
import AdminUser from "../models/AdminUser.js";
import { cacheGet, cacheSet } from "../config/redis.js";

// Trade-off worth knowing: a role change or account deletion can take
// up to this long to take effect for an already-issued session, since
// we're serving from cache in between. 5 minutes is a deliberate choice
// — short enough that it's not a real security gap, long enough to
// remove the DB round-trip from the vast majority of requests.
const USER_CACHE_TTL = 300;

export async function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return res.status(401).json({ message: "Session expired, please log in again" });
  }

  const cacheKey = `staff:${payload.sub}`;
  let user = await cacheGet(cacheKey);

  if (!user) {
    user = await AdminUser.findById(payload.sub).select("-passwordHash").lean();
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    await cacheSet(cacheKey, user, USER_CACHE_TTL);
  }

  req.user = user;
  next();
}

// Stacks AFTER requireAuth (needs req.user already set). Restricts a
// route to the "admin" role — regular "staff" accounts get a 403.
// Used for staff management and the analytics dashboard, since those
// are capabilities a founder/owner should have, not every staff login.
export function requireAdminRole(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}