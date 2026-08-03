import { verifyToken, CLIENT_COOKIE_NAME } from "../utils/jwt.js";
import Customer from "../models/Customer.js";

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

  const customer = await Customer.findById(payload.sub).select("-passwordHash");
  if (!customer) {
    return res.status(401).json({ message: "Please sign in to continue" });
  }

  req.customer = customer;
  next();
}
