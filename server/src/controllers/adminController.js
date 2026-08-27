import bcrypt from "bcryptjs";
import AdminUser, { BLOOD_GROUPS } from "../models/AdminUser.js";
import Shipment from "../models/Shipment.js";
import BookingRequest from "../models/BookingRequest.js";
import AuditLog from "../models/AuditLog.js";
import { encryptField, decryptField, hashLookupValue } from "../utils/crypto.js";
import { OFFICE_CODES, getOfficeName, isValidOfficeCode } from "../config/offices.js";

// ---------------------------------------------------------------------------
// STAFF MANAGEMENT — creating staff/admin accounts from inside the app,
// instead of only via the create-admin CLI script. Still no public
// signup: only an already-authenticated admin can reach these routes.
//
// Mobile number is PII and is encrypted at rest (see utils/crypto.js),
// the same way customer PII is handled elsewhere in this codebase.
// Office is restricted to the known office codes in config/offices.js —
// never a free-text location — and stored in a single `officeCode` column.
// ---------------------------------------------------------------------------

const MOBILE_REGEX = /^[6-9]\d{9}$/; // 10-digit Indian mobile number, no country code
const MIN_STAFF_AGE_YEARS = 18;

function serializeStaff(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    mobileNumber: decryptField(user.encryptedMobile),
    officeCode: user.officeCode,
    officeName: getOfficeName(user.officeCode),
    dob: user.dob,
    bloodGroup: user.bloodGroup || null,
    mustChangePassword: user.mustChangePassword,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

function validateDob(dobRaw) {
  if (!dobRaw) return "Date of birth is required";
  const dob = new Date(dobRaw);
  if (Number.isNaN(dob.getTime())) return "Date of birth is invalid";
  if (dob > new Date()) return "Date of birth cannot be in the future";
  const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  if (age < MIN_STAFF_AGE_YEARS) return `Staff must be at least ${MIN_STAFF_AGE_YEARS} years old`;
  return null;
}

export async function listStaff(req, res) {
  const staff = await AdminUser.find().select("-passwordHash").sort({ createdAt: -1 });
  res.json(staff.map(serializeStaff));
}

export async function createStaff(req, res) {
  const { name, email, password, role, mobileNumber, officeCode, dob, bloodGroup } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }
  if (!["admin", "staff"].includes(role)) {
    return res.status(400).json({ message: "Role must be 'admin' or 'staff'" });
  }

  const cleanMobile = String(mobileNumber || "").trim();
  if (!MOBILE_REGEX.test(cleanMobile)) {
    return res.status(400).json({ message: "A valid 10-digit mobile number is required" });
  }

  if (!isValidOfficeCode(officeCode)) {
    return res.status(400).json({ message: `Office must be one of: ${OFFICE_CODES.join(", ")}` });
  }

  const dobError = validateDob(dob);
  if (dobError) {
    return res.status(400).json({ message: dobError });
  }

  if (bloodGroup && !BLOOD_GROUPS.includes(bloodGroup)) {
    return res.status(400).json({ message: `Blood group must be one of: ${BLOOD_GROUPS.join(", ")}` });
  }

  const existing = await AdminUser.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(409).json({ message: "An account with this email already exists" });
  }

  const mobileHash = hashLookupValue(cleanMobile);
  const existingMobile = await AdminUser.findOne({ mobileHash });
  if (existingMobile) {
    return res.status(409).json({ message: "An account with this mobile number already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await AdminUser.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    role,
    encryptedMobile: encryptField(cleanMobile),
    mobileHash,
    officeCode,
    dob: new Date(dob),
    bloodGroup: bloodGroup || null,
    // Always required to change on first login — this is doubly important
    // when the temp password was generated from the staff member's DOB,
    // since that's a predictable/guessable password.
    mustChangePassword: true,
  });

  res.status(201).json(serializeStaff(user));
}

// ---------------------------------------------------------------------------
// ANALYTICS / AUDIT DASHBOARD — aggregate view across every shipment and
// booking, plus a recent cross-shipment activity feed. Admin-only: this
// is broader visibility than a single staff member reviewing one
// shipment's own audit trail (which stays available to all staff via
// GET /api/track/:trackingId/audit).
// ---------------------------------------------------------------------------

export async function getAnalytics(req, res) {
  const [shipmentsByStatus, bookingsByStatus, totalShipments, totalBookings, recentActivity] =
    await Promise.all([
      Shipment.aggregate([{ $group: { _id: "$currentStatus", count: { $sum: 1 } } }]),
      BookingRequest.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Shipment.countDocuments(),
      BookingRequest.countDocuments(),
      AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(30)
        .populate("performedBy", "name email")
        .select("-before -after"),
    ]);

  res.json({
    totalShipments,
    totalBookings,
    shipmentsByStatus: Object.fromEntries(shipmentsByStatus.map((s) => [s._id, s.count])),
    bookingsByStatus: Object.fromEntries(bookingsByStatus.map((b) => [b._id, b.count])),
    recentActivity,
  });
}
