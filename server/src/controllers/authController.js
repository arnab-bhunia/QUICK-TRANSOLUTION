import bcrypt from "bcryptjs";
import AdminUser from "../models/AdminUser.js";
import { signToken, COOKIE_NAME, cookieOptions } from "../utils/jwt.js";

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await AdminUser.findOne({ email: email.toLowerCase().trim() });
  // Same generic message whether the email doesn't exist or the
  // password is wrong — never reveal which one it was.
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken({ sub: user._id.toString() });
  res.cookie(COOKIE_NAME, token, cookieOptions);

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
}

export function logout(req, res) {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
  res.json({ message: "Logged out" });
}

export function me(req, res) {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
}
