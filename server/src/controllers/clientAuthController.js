import bcrypt from "bcryptjs";
import Customer from "../models/Customer.js";
import {
  signToken,
  CLIENT_COOKIE_NAME,
  clientCookieOptions,
  CLIENT_EXPIRES_IN,
} from "../utils/jwt.js";

function setClientSession(res, customer) {
  const token = signToken({ sub: customer._id.toString(), type: "customer" }, CLIENT_EXPIRES_IN);
  res.cookie(CLIENT_COOKIE_NAME, token, clientCookieOptions);
}

function shape(customer) {
  return {
    id: customer._id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
  };
}

export async function signup(req, res) {
  const { name, email, phone, password } = req.body;

  if (!name?.trim() || !email?.trim() || !phone?.trim() || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  const existing = await Customer.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(409).json({ message: "An account with this email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const customer = await Customer.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    passwordHash,
    lastLoginAt: new Date(),
  });

  setClientSession(res, customer);
  res.status(201).json(shape(customer));
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const customer = await Customer.findOne({ email: email.toLowerCase().trim() });
  if (!customer) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, customer.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid email or password" });
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
