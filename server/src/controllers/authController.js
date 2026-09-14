import bcrypt from "bcryptjs";
import AdminUser from "../models/AdminUser.js";
import EmailOtp from "../models/EmailOtp.js";
import AuditLog from "../models/AuditLog.js";
import { signToken, COOKIE_NAME, cookieOptions } from "../utils/jwt.js";
import { cacheDel } from "../config/redis.js";
import { computePermissions } from "../config/permissions.js";
import { getOfficeName } from "../config/offices.js";
import { generateOtp, hashOtp } from "../utils/otp.js";
import { sendMail } from "../utils/mailer.js";

// ---------------------------------------------------------------------------
// FORGOT PASSWORD — reuses the same EmailOtp model/hashing scheme as the
// customer signup flow (utils/otp.js), just under its own "password_reset"
// purpose so a code from one flow can never be used against the other.
// ---------------------------------------------------------------------------
const RESET_OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes — short-lived on purpose
const MAX_RESET_OTP_ATTEMPTS = 5;

function shape(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    managedBy: user.managedBy,
    permissions: computePermissions(user),
    mustChangePassword: user.mustChangePassword,
  };
}

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

  const token = signToken({ sub: user._id.toString(), sv: user.sessionVersion || 0 });
  res.cookie(COOKIE_NAME, token, cookieOptions);

  res.json(shape(user));
}

export function logout(req, res) {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
  res.json({ message: "Logged out" });
}

export function me(req, res) {
  res.json(shape(req.user));
}

// ---------------------------------------------------------------------------
// MY ACCOUNT — GET /api/auth/account
// Always operates on the authenticated request's own identity (req.user,
// set by requireAuth) — there is no :userId param, so there's nothing for
// a client to tamper with to view someone else's account. managedBy and
// officeCode are resolved here, server-side, from the account's own
// stored fields; nothing about organizational identity ever comes from
// the request body/query.
// ---------------------------------------------------------------------------
export async function getAccount(req, res) {
  const user = await AdminUser.findById(req.user._id).populate("managedBy", "name role");
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    manager: user.managedBy ? { name: user.managedBy.name, role: user.managedBy.role } : null,
    office: { code: user.officeCode, name: getOfficeName(user.officeCode) },
    lastLoginAt: user.lastLoginAt,
  });
}

// ---------------------------------------------------------------------------
// CHANGE PASSWORD — self-service, requires the current password. This is
// how a staff/admin account gets off a temporary password (e.g. one that
// was generated from their DOB at account creation) and clears the
// mustChangePassword flag that gates access on the client.
// ---------------------------------------------------------------------------
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new password are required" });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: "New password must be at least 8 characters" });
  }
  if (newPassword === currentPassword) {
    return res.status(400).json({ message: "New password must be different from the current password" });
  }

  const user = await AdminUser.findById(req.user._id);
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.mustChangePassword = false;
  // Invalidates every token issued before this moment (see
  // middleware/auth.js) — any other device/tab currently signed in with
  // the old password gets logged out the next time it makes a request.
  user.sessionVersion = (user.sessionVersion || 0) + 1;
  await user.save();

  // Drop the cached /me user so requireAuth doesn't keep serving the
  // stale mustChangePassword: true value for up to USER_CACHE_TTL.
  await cacheDel(`staff:${user._id}`);

  await AuditLog.create({
    action: "account_password_changed",
    performedBy: user._id,
    ipAddress: req.ip,
  });

  // Re-issue the cookie bound to the new session version so THIS browser
  // stays signed in — only tokens issued before the change are rejected.
  const token = signToken({ sub: user._id.toString(), sv: user.sessionVersion });
  res.cookie(COOKIE_NAME, token, cookieOptions);

  res.json({ message: "Password updated" });
}

// ---------------------------------------------------------------------------
// FORGOT PASSWORD FLOW — unauthenticated, three steps:
//   1. POST /forgot-password        { email }              -> generic response always
//   2. POST /forgot-password/verify { email, otp }          -> confirms the code is correct
//   3. POST /forgot-password/reset  { email, otp, newPassword } -> consumes the code, sets the password
//
// The email is re-validated at step 3 as well (not just step 2) so the
// code is never "spent" on a verify-only call — it's only deleted once a
// password has actually been set, keeping it genuinely single-use.
// ---------------------------------------------------------------------------
async function sendPasswordResetOtp(email) {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + RESET_OTP_TTL_MS);

  // Only the most recent code for this email/purpose should ever be valid.
  await EmailOtp.deleteMany({ email, purpose: "password_reset" });
  await EmailOtp.create({ email, otpHash: hashOtp(otp, email), purpose: "password_reset", expiresAt });

  await sendMail({
    to: email,
    subject: "Password reset code — Quick Transolution Staff Portal",
    text: `Your password reset code is ${otp}. It expires in 5 minutes. If you didn't request this, you can safely ignore this email — your password will not be changed.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <p>Your password reset code is:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; margin: 16px 0;">${otp}</p>
        <p style="color: #666; font-size: 13px;">This code expires in 5 minutes. If you didn't request this, you can safely ignore this email — your password will not be changed.</p>
      </div>
    `,
  });
}

// A single generic response used for every outcome of step 1 — whether
// the email is registered or not — so this endpoint can't be used to
// enumerate staff accounts.
const GENERIC_FORGOT_PASSWORD_MESSAGE =
  "If that email is registered, a verification code has been sent to it.";

export async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email?.trim()) {
    return res.status(400).json({ message: "Email is required." });
  }
  const emailNorm = email.toLowerCase().trim();

  const user = await AdminUser.findOne({ email: emailNorm });
  if (user) {
    await sendPasswordResetOtp(emailNorm);
    await AuditLog.create({
      action: "account_password_reset_requested",
      performedBy: user._id,
      ipAddress: req.ip,
    });
  }

  res.json({ message: GENERIC_FORGOT_PASSWORD_MESSAGE });
}

// Shared by both verify and reset — looks up the latest unexpired code,
// checks the attempt ceiling, and compares hashes. Returns the matching
// EmailOtp document on success; otherwise sends the appropriate error
// response itself and returns null so the caller can just `return` on a
// falsy result.
async function checkResetOtp(req, res, emailNorm, otp) {
  const record = await EmailOtp.findOne({
    email: emailNorm,
    purpose: "password_reset",
    consumedAt: null,
  }).sort({ createdAt: -1 });

  if (!record || record.expiresAt < new Date()) {
    res.status(400).json({ message: "Code expired or invalid. Please request a new one." });
    return null;
  }
  if (record.attempts >= MAX_RESET_OTP_ATTEMPTS) {
    res.status(429).json({ message: "Too many attempts. Please request a new code." });
    return null;
  }

  const submittedHash = hashOtp(otp, emailNorm);
  if (submittedHash !== record.otpHash) {
    record.attempts += 1;
    await record.save();
    res.status(400).json({ message: "Incorrect code. Please try again." });
    return null;
  }

  return record;
}

export async function verifyForgotPasswordOtp(req, res) {
  const { email, otp } = req.body;
  if (!email?.trim() || !otp?.trim()) {
    return res.status(400).json({ message: "Email and verification code are required." });
  }
  const emailNorm = email.toLowerCase().trim();

  const record = await checkResetOtp(req, res, emailNorm, otp.trim());
  if (!record) return; // checkResetOtp already sent the error response

  res.json({ valid: true });
}

export async function resetForgotPassword(req, res) {
  const { email, otp, newPassword } = req.body;
  if (!email?.trim() || !otp?.trim() || !newPassword) {
    return res.status(400).json({ message: "Email, code, and new password are required." });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: "New password must be at least 8 characters." });
  }
  const emailNorm = email.toLowerCase().trim();

  const record = await checkResetOtp(req, res, emailNorm, otp.trim());
  if (!record) return; // checkResetOtp already sent the error response

  const user = await AdminUser.findOne({ email: emailNorm });
  if (!user) {
    // The OTP matched an email that no longer has an account — treat the
    // same as an invalid code rather than confirming/denying anything.
    return res.status(400).json({ message: "Code expired or invalid. Please request a new one." });
  }

  const sameAsBefore = await bcrypt.compare(newPassword, user.passwordHash);
  if (sameAsBefore) {
    return res
      .status(400)
      .json({ message: "New password must be different from your previous password." });
  }

  // Atomic single-use claim — the actual point of "consuming" the code.
  // This conditional update can only match while consumedAt is still
  // null and the code hasn't expired; MongoDB guarantees only one
  // concurrent findOneAndUpdate on the same document can win that race.
  // If two reset requests arrive at the same instant with the same valid
  // OTP, the loser's update matches zero documents and `claimed` comes
  // back null here, so only one request can ever go on to change the
  // password.
  const claimed = await EmailOtp.findOneAndUpdate(
    { _id: record._id, consumedAt: null, expiresAt: { $gt: new Date() } },
    { $set: { consumedAt: new Date() } },
    { new: true }
  );
  if (!claimed) {
    return res.status(400).json({ message: "Code expired or invalid. Please request a new one." });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.mustChangePassword = false;
  // Same reasoning as changePassword() above — a reset invalidates every
  // token issued before it too.
  user.sessionVersion = (user.sessionVersion || 0) + 1;
  await user.save();

  await cacheDel(`staff:${user._id}`);
  // Belt-and-suspenders cleanup — the atomic claim above is what actually
  // enforces single-use; this just removes the now-spent (and any other
  // stale) password_reset codes for this email so none linger until the
  // TTL index sweeps them.
  await EmailOtp.deleteMany({ email: emailNorm, purpose: "password_reset" });

  await AuditLog.create({
    action: "account_password_reset_completed",
    performedBy: user._id,
    ipAddress: req.ip,
  });

  res.json({ message: "Password reset successfully. Please log in with your new password." });
}