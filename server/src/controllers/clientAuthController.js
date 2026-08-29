import bcrypt from "bcryptjs";
import Customer from "../models/Customer.js";
import EmailOtp from "../models/EmailOtp.js";
import {
  signToken,
  CLIENT_COOKIE_NAME,
  clientCookieOptions,
  CLIENT_EXPIRES_IN,
} from "../utils/jwt.js";
import { encryptField, decryptField, hashLookupValue } from "../utils/crypto.js";
import { generateOtp, hashOtp } from "../utils/otp.js";
import { sendMail } from "../utils/mailer.js";

// Server-side re-enforcement of every rule the signup form already
// checks client-side. The frontend's constraints are a UX nicety, not a
// security boundary — a request sent directly to this API bypassing the
// browser must be validated exactly as strictly as one that went through
// the form.
const PHONE_RE = /^\d{10}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MAX = 100;
const INDUSTRY_MAX = 100;
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_OTP_ATTEMPTS = 5;

function setClientSession(res, customer) {
  const token = signToken({ sub: customer._id.toString(), type: "customer" }, CLIENT_EXPIRES_IN);
  res.cookie(CLIENT_COOKIE_NAME, token, clientCookieOptions);
}

function shape(customer) {
  return {
    id: customer._id,
    name: customer.name,
    email: customer.email,
    phone: decryptField(customer.encryptedPhone),
    dob: customer.dob,
    industry: customer.industry,
    emailVerified: customer.emailVerified,
  };
}

function isValidDob(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  if (date > now) return false; // can't be born in the future
  const ageYears = (now - date) / (1000 * 60 * 60 * 24 * 365.25);
  return ageYears <= 120; // sanity ceiling, not a strict business rule
}

async function sendSignupOtp(email) {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  // Invalidate any previous unused code for this email before issuing a
  // new one — only the most recent code should ever be valid.
  await EmailOtp.deleteMany({ email, purpose: "signup" });
  await EmailOtp.create({ email, otpHash: hashOtp(otp, email), purpose: "signup", expiresAt });

  await sendMail({
    to: email,
    subject: "Your verification code — Quick Transolution",
    text: `Your verification code is ${otp}. It expires in 10 minutes. If you didn't request this, you can safely ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <p>Your verification code is:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; margin: 16px 0;">${otp}</p>
        <p style="color: #666; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function signup(req, res) {
  const { name, email, phone, password, confirmPassword, dob, industry, agreedToTerms } = req.body;

  if (agreedToTerms !== true) {
    return res.status(400).json({ message: "Please accept the Terms of Service and Privacy Policy." });
  }

  if (!name?.trim() || !email?.trim() || !phone?.trim() || !password || !dob) {
    return res.status(400).json({ message: "Please fill in all required fields." });
  }
  if (name.trim().length > NAME_MAX) {
    return res.status(400).json({ message: "Name is too long." });
  }
  if (!EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }
  if (!PHONE_RE.test(phone.trim())) {
    return res.status(400).json({ message: "Mobile number must be exactly 10 digits." });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters." });
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }
  if (!isValidDob(dob)) {
    return res.status(400).json({ message: "Please enter a valid date of birth." });
  }

  const emailNorm = email.toLowerCase().trim();
  const phoneTrimmed = phone.trim();

  const existing = await Customer.findOne({ email: emailNorm });
  if (existing) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const customer = await Customer.create({
    name: name.trim(),
    email: emailNorm,
    encryptedPhone: encryptField(phoneTrimmed),
    phoneHash: hashLookupValue(phoneTrimmed),
    dob: new Date(dob),
    industry: industry?.trim().slice(0, INDUSTRY_MAX) || "",
    passwordHash,
    emailVerified: false,
    policyAcceptedAt: new Date(),
  });

  await sendSignupOtp(emailNorm);

  // No session cookie yet — login is gated behind email verification.
  res.status(201).json({
    message: "Account created. We've sent a verification code to your email.",
    email: customer.email,
    needsVerification: true,
  });
}

export async function verifyEmail(req, res) {
  const { email, otp } = req.body;
  if (!email?.trim() || !otp?.trim()) {
    return res.status(400).json({ message: "Email and verification code are required." });
  }

  const emailNorm = email.toLowerCase().trim();
  const record = await EmailOtp.findOne({ email: emailNorm, purpose: "signup" }).sort({
    createdAt: -1,
  });

  if (!record || record.expiresAt < new Date()) {
    return res.status(400).json({ message: "Code expired. Please request a new one." });
  }
  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    return res.status(429).json({ message: "Too many attempts. Please request a new code." });
  }

  const submittedHash = hashOtp(otp.trim(), emailNorm);
  if (submittedHash !== record.otpHash) {
    record.attempts += 1;
    await record.save();
    return res.status(400).json({ message: "Incorrect code. Please try again." });
  }

  const customer = await Customer.findOne({ email: emailNorm });
  if (!customer) {
    return res.status(404).json({ message: "Account not found." });
  }

  customer.emailVerified = true;
  customer.lastLoginAt = new Date();
  await customer.save();
  await EmailOtp.deleteMany({ email: emailNorm, purpose: "signup" });

  // Verification doubles as first login — no reason to make them log in
  // again immediately after proving they own the email.
  setClientSession(res, customer);
  res.json(shape(customer));
}

export async function resendOtp(req, res) {
  const { email } = req.body;
  if (!email?.trim()) {
    return res.status(400).json({ message: "Email is required." });
  }
  const emailNorm = email.toLowerCase().trim();

  const customer = await Customer.findOne({ email: emailNorm });
  if (!customer) {
    // Deliberately vague — confirming/denying account existence here
    // would let this endpoint be used to enumerate registered emails.
    return res.json({ message: "If an account exists for this email, a new code has been sent." });
  }
  if (customer.emailVerified) {
    return res.status(400).json({ message: "This email is already verified. Please log in." });
  }

  await sendSignupOtp(emailNorm);
  res.json({ message: "A new verification code has been sent." });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const customer = await Customer.findOne({ email: email.toLowerCase().trim() });
  if (!customer) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const valid = await bcrypt.compare(password, customer.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  if (!customer.emailVerified) {
    return res.status(403).json({
      message: "Please verify your email before logging in.",
      needsVerification: true,
      email: customer.email,
    });
  }

  customer.lastLoginAt = new Date();
  await customer.save();

  setClientSession(res, customer);
  res.json(shape(customer));
}

export function logout(req, res) {
  res.clearCookie(CLIENT_COOKIE_NAME, { ...clientCookieOptions, maxAge: undefined });
  res.json({ message: "Logged out" });
}

export function me(req, res) {
  res.json(shape(req.customer));
}
