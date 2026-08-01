import { verifyToken, COOKIE_NAME } from "../utils/jwt.js";
import AdminUser from "../models/AdminUser.js";

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

  const user = await AdminUser.findById(payload.sub).select("-passwordHash");
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  req.user = user;
  next();
}
