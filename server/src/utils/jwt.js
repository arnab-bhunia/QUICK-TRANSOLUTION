import jwt from "jsonwebtoken";

const DEFAULT_EXPIRES_IN = "8h";

export function signToken(payload, expiresIn = DEFAULT_EXPIRES_IN) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }
  return jwt.verify(token, process.env.JWT_SECRET);
}

// --- Staff/admin session cookie ---
export const COOKIE_NAME = "qt_session";

// httpOnly: JS on the page (including any injected via XSS) can't read
// this cookie — that's the whole point of not using localStorage for
// the session token. secure is only enforced in production because
// local dev over plain http would otherwise silently drop the cookie.
// sameSite: "lax" works fine in local dev (frontend and backend are
// effectively the same site there). In production, Vercel (frontend) and
// Render (backend) are DIFFERENT domains — that makes every API call a
// cross-site request, and browsers refuse to send a "Lax" cookie on
// cross-site requests at all. "None" is required for a cross-domain
// cookie to be sent, and "None" is only valid when paired with
// `secure: true` (which is already conditional on production above).
const isProd = process.env.NODE_ENV === "production";

export const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 8 * 60 * 60 * 1000, // 8h — keep in sync with DEFAULT_EXPIRES_IN above
};

// --- Customer session cookie — a different name from COOKIE_NAME above
// on purpose, so a logged-in staff member and a logged-in customer on
// the same browser never share or overwrite each other's session ---
export const CLIENT_COOKIE_NAME = "qt_client_session";
export const CLIENT_EXPIRES_IN = "7d";

export const clientCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7d — keep in sync with CLIENT_EXPIRES_IN above
};