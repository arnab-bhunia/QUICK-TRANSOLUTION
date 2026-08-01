import jwt from "jsonwebtoken";

const EXPIRES_IN = "8h";

export function signToken(payload) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }
  return jwt.verify(token, process.env.JWT_SECRET);
}

export const COOKIE_NAME = "qt_session";

// httpOnly: JS on the page (including any injected via XSS) can't read
// this cookie — that's the whole point of not using localStorage for
// the session token. secure is only enforced in production because
// local dev over plain http would otherwise silently drop the cookie.
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 8 * 60 * 60 * 1000, // 8h — keep in sync with EXPIRES_IN above
};
