import bcrypt from "bcryptjs";
import AdminUser, { BLOOD_GROUPS } from "../models/AdminUser.js";
import Shipment from "../models/Shipment.js";
import BookingRequest from "../models/BookingRequest.js";
import AuditLog from "../models/AuditLog.js";
import { encryptField, decryptField, hashLookupValue } from "../utils/crypto.js";
import { OFFICE_CODES, getOfficeName, isValidOfficeCode } from "../config/offices.js";
import { CREATION_RULES } from "../config/permissions.js";

// ---------------------------------------------------------------------------
// STAFF MANAGEMENT — creating staff/admin/hr/manager accounts from inside
// the app, instead of only via the create-admin CLI script. Still no
// public signup: only an already-authenticated, permitted account can
// reach these routes.
//
// Mobile number is PII and is encrypted at rest (see utils/crypto.js).
// Office is restricted to the known office codes in config/offices.js.
//
// On top of that existing validation, account creation is now also
// gated by CREATION_RULES (config/permissions.js) — which roles a given
// creator is allowed to bring into the system — and, for "staff"
// accounts specifically, by managedBy resolution: a manager creating
// staff is force-assigned to themselves; an admin/hr creating staff
// must explicitly choose a real, existing manager (see listManagers
// below), never trusted as freeform input.
// ---------------------------------------------------------------------------

const MOBILE_REGEX = /^[6-9]\d{9}$/; // 10-digit Indian mobile number, no country code
const MIN_STAFF_AGE_YEARS = 18;

function serializeStaff(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    managedBy: user.managedBy, // populated with { _id, name, email } where relevant
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
  const requester = req.user;
  let query = {};

  // Scoping: a manager only ever sees their own direct reports. Every
  // other role permitted to reach this route (admin, hr) sees everyone.
  if (requester.role === "manager") {
    query = { managedBy: requester._id, role: "staff" };
  }

  const staff = await AdminUser.find(query)
    .select("-passwordHash -extraPermissions")
    .populate("managedBy", "name email role")
    .sort({ createdAt: -1 });

  res.json(staff.map(serializeStaff));
}

// Populates the "assign to manager" dropdown when an admin/hr creates a
// staff account. Managers themselves never call this — their own staff
// creations are auto-assigned to themselves, no picker needed.
export async function listManagers(req, res) {
  const managers = await AdminUser.find({ role: "manager" })
    .select("name email")
    .sort({ name: 1 });
  res.json(managers.map((m) => ({ id: m._id, name: m.name, email: m.email })));
}

export async function createStaff(req, res) {
  const requester = req.user;
  const { name, email, password, role, mobileNumber, officeCode, dob, bloodGroup, managedBy } =
    req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  const allowedToCreate = CREATION_RULES[requester.role] || [];
  if (!allowedToCreate.includes(role)) {
    return res.status(403).json({ message: `You are not allowed to create a "${role}" account.` });
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

  // --- managedBy resolution — the security-sensitive part ---
  let resolvedManagedBy = null;

  if (role === "staff") {
    if (requester.role === "manager") {
      // Forced to self, full stop — a manager can never assign their
      // new staff member to anyone else, no matter what the request
      // body says.
      resolvedManagedBy = requester._id;
    } else {
      // admin / hr creating staff: must explicitly pick a real manager.
      if (!managedBy) {
        return res.status(400).json({ message: "Please select a manager for this staff account." });
      }
      const manager = await AdminUser.findById(managedBy);
      if (!manager || manager.role !== "manager") {
        return res.status(400).json({ message: "Selected manager account is invalid." });
      }
      resolvedManagedBy = manager._id;
    }
  } else {
    // Non-staff roles (hr, manager, admin, content_writer): managedBy is
    // just an audit trail of who onboarded them, not used for any
    // permission scoping.
    resolvedManagedBy = requester._id;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await AdminUser.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    role,
    managedBy: resolvedManagedBy,
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
// ANALYTICS / AUDIT DASHBOARD — unchanged. Still admin-only (not part of
// HR's "staff part only" scope, and not something a manager needs beyond
// their own shipments/bookings visibility).
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
