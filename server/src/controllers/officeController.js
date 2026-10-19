import Office from "../models/Office.js";
import AdminUser from "../models/AdminUser.js";
import { createOfficeWithUniqueCode } from "../utils/officeId.js";
import { deactivateOfficeGuarded, OfficeRuleError } from "../utils/officeAssignment.js";

// ---------------------------------------------------------------------------
// OFFICE MANAGEMENT. Offices are never deleted, only deactivated, so that
// historical employee assignments (AdminUser.officeCode) keep resolving.
// Every route using these handlers is gated by requireAuth +
// requirePermission("offices:manage") — see routes/offices.js.
// ---------------------------------------------------------------------------

const CODE_PARAM_REGEX = /^[A-Za-z0-9_-]{3,32}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+()\-\s]{6,30}$/;
const EDITABLE_FIELDS = ["name", "address", "city", "state", "country", "phone", "email"];

const AUDIT_POPULATE = "name email";
const PEOPLE = "createdBy updatedBy deactivatedBy";
// Audit data is written only by the server. A client that tries to supply it
// gets an explicit 400 rather than being silently ignored.
const PROTECTED_FIELDS = ["createdBy", "updatedBy", "deactivatedBy", "deactivatedAt", "statusHistory", "isActive"];

// createdBy / updatedBy are returned as { _id, name, email } when populated.
function personOf(p) {
  return p && p.name ? { _id: p._id, name: p.name, email: p.email } : null;
}

function serialize(office, employeeCount) {
  return {
    code: office.code,
    name: office.name,
    address: office.address || "",
    city: office.city || "",
    state: office.state || "",
    country: office.country || "",
    phone: office.phone || "",
    email: office.email || "",
    isActive: office.isActive,
    createdAt: office.createdAt,
    updatedAt: office.updatedAt,
    createdBy: personOf(office.createdBy),
    updatedBy: personOf(office.updatedBy),
    deactivatedBy: personOf(office.deactivatedBy),
    deactivatedAt: office.deactivatedAt || null,
    ...(employeeCount === undefined ? {} : { employeeCount }),
  };
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Validates + normalizes the editable fields. `partial` = PATCH semantics.
function parseOfficeInput(body, { partial = false } = {}) {
  const data = {};
  for (const field of EDITABLE_FIELDS) {
    if (body[field] === undefined) continue;
    if (typeof body[field] !== "string") return { error: `${field} must be text` };
    data[field] = body[field].trim();
  }

  if (!partial && !data.name) return { error: "Office name is required" };
  if (data.name !== undefined && !data.name) return { error: "Office name is required" };
  if (data.name && data.name.length > 120) return { error: "Office name is too long" };
  if (data.email && !EMAIL_REGEX.test(data.email)) return { error: "Office email is invalid" };
  if (data.phone && !PHONE_REGEX.test(data.phone)) return { error: "Office phone number is invalid" };
  return { data };
}

function duplicateNameResponse(err, res) {
  if (err?.code === 11000) {
    res.status(409).json({ message: "An office with this name already exists" });
    return true;
  }
  return false;
}

export async function listOffices(req, res) {
  const { q, status } = req.query;
  const filter = {};
  if (status === "active") filter.isActive = true;
  else if (status === "inactive") filter.isActive = false;

  if (typeof q === "string" && q.trim()) {
    const rx = new RegExp(escapeRegex(q.trim().slice(0, 80)), "i");
    filter.$or = [{ code: rx }, { name: rx }, { city: rx }, { state: rx }, { country: rx }];
  }

  const offices = await Office.find(filter)
    .select("-statusHistory")
    .sort({ name: 1 })
    .populate(PEOPLE, AUDIT_POPULATE)
    .lean();

  // Employee counts for the directory. AdminUser has no "inactive" flag —
  // every account is active — so the count is simply accounts per office.
  const counts = await AdminUser.aggregate([
    { $match: { officeCode: { $in: offices.map((o) => o.code) } } },
    { $group: { _id: "$officeCode", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [c._id, c.count]));

  res.json(offices.map((o) => serialize(o, countMap.get(o.code) || 0)));
}

export async function getOffice(req, res) {
  const { code } = req.params;
  if (!CODE_PARAM_REGEX.test(code)) return res.status(400).json({ message: "Invalid office ID" });

  const office = await Office.findOne({ code: code.toUpperCase() })
    .select("-statusHistory")
    .populate(PEOPLE, AUDIT_POPULATE)
    .lean();
  if (!office) return res.status(404).json({ message: "Office not found" });

  const employeeCount = await AdminUser.countDocuments({ officeCode: office.code });
  res.json(serialize(office, employeeCount));
}

export async function createOffice(req, res) {
  // The ID is always server-generated — any `code` sent is rejected outright
  // rather than silently ignored, so a client bug can't look like it worked.
  if (req.body?.code !== undefined) {
    return res.status(400).json({ message: "Office ID is generated automatically and cannot be set" });
  }

  if (PROTECTED_FIELDS.some((f) => req.body?.[f] !== undefined)) {
    return res.status(400).json({ message: "Audit and status fields are set by the server and cannot be supplied" });
  }
  const { data, error } = parseOfficeInput(req.body || {});
  if (error) return res.status(400).json({ message: error });

  try {
    const office = await createOfficeWithUniqueCode(Office, {
      ...data,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
    await office.populate(PEOPLE, AUDIT_POPULATE);
    res.status(201).json(serialize(office, 0));
  } catch (err) {
    if (duplicateNameResponse(err, res)) return;
    if (err.expose) return res.status(err.status || 503).json({ message: err.message });
    throw err;
  }
}

export async function updateOffice(req, res) {
  const { code } = req.params;
  if (!CODE_PARAM_REGEX.test(code)) return res.status(400).json({ message: "Invalid office ID" });

  if (req.body?.code !== undefined && String(req.body.code).toUpperCase() !== code.toUpperCase()) {
    return res.status(400).json({ message: "Office ID cannot be changed" });
  }
  if (PROTECTED_FIELDS.some((f) => req.body?.[f] !== undefined)) {
    return res.status(400).json({
      message:
        "Status and audit fields cannot be edited here. Use the activate / deactivate actions to change status.",
    });
  }

  const { data, error } = parseOfficeInput(req.body || {}, { partial: true });
  if (error) return res.status(400).json({ message: error });

  const office = await Office.findOne({ code: code.toUpperCase() });
  if (!office) return res.status(404).json({ message: "Office not found" });

  office.set({ ...data, updatedBy: req.user._id });
  try {
    await office.save();
    await office.populate(PEOPLE, AUDIT_POPULATE);
  } catch (err) {
    if (duplicateNameResponse(err, res)) return;
    throw err;
  }
  res.json(serialize(office));
}

// ---------------------------------------------------------------------------
// DEACTIVATION — business rule: an office with ANY account assigned cannot be
// deactivated. AdminUser has no inactive flag, so every account (staff,
// manager, HR, admin) counts. The concurrency-safe implementation (a
// transaction where supported, otherwise a lease-based gate) lives in
// utils/officeAssignment.js. This handler reports success only if the office
// really ended up inactive.
// ---------------------------------------------------------------------------
export async function deactivateOffice(req, res) {
  const { code } = req.params;
  if (!CODE_PARAM_REGEX.test(code)) return res.status(400).json({ message: "Invalid office ID" });

  try {
    const office = await deactivateOfficeGuarded(code.toUpperCase(), req.user._id);
    await office.populate(PEOPLE, AUDIT_POPULATE);
    res.json(serialize(office, 0));
  } catch (err) {
    if (err instanceof OfficeRuleError) return res.status(err.status).json({ message: err.message });
    throw err;
  }
}

// Read-only list of ACTIVE offices (code + name) for the staff-creation
// dropdown. Gated by team:create_staff in routes/offices.js, so HR/manager
// can populate the form without any office-management rights.
export async function listOfficeOptions(req, res) {
  const offices = await Office.find({ isActive: true }).select("code name").sort({ name: 1 }).lean();
  res.json(offices.map((o) => ({ code: o.code, name: o.name })));
}

// Reactivation: ONE atomic, conditional update — status, cleared current
// deactivation state, ordinary modification fields and the REACTIVATED
// history entry commit together. The isActive:false condition means repeated
// or concurrent requests produce exactly one event (the rest get a 409).
// Earlier DEACTIVATED events in statusHistory are never touched.
export async function reactivateOffice(req, res) {
  const { code } = req.params;
  if (!CODE_PARAM_REGEX.test(code)) return res.status(400).json({ message: "Invalid office ID" });
  const officeCode = code.toUpperCase();

  const at = new Date();
  const updated = await Office.findOneAndUpdate(
    { code: officeCode, isActive: false },
    {
      $set: { isActive: true, updatedBy: req.user._id, deactivatedBy: null, deactivatedAt: null },
      $push: { statusHistory: { officeCode, type: "REACTIVATED", by: req.user._id, at } },
    },
    { new: true }
  ).populate(PEOPLE, AUDIT_POPULATE);
  if (!updated) {
    const existing = await Office.findOne({ code: officeCode }).lean();
    if (!existing) return res.status(404).json({ message: "Office not found" });
    return res.status(409).json({ message: "This office is already active" });
  }
  res.json(serialize(updated));
}

// Read-only audit trail (newest first). Same guard as every other office
// route: requireAuth + offices:manage (admin only).
export async function getOfficeHistory(req, res) {
  const { code } = req.params;
  if (!CODE_PARAM_REGEX.test(code)) return res.status(400).json({ message: "Invalid office ID" });

  const office = await Office.findOne({ code: code.toUpperCase() })
    .populate("statusHistory.by", AUDIT_POPULATE)
    .lean();
  if (!office) return res.status(404).json({ message: "Office not found" });

  const events = [...(office.statusHistory || [])]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .map((e) => ({ officeCode: e.officeCode, type: e.type, by: personOf(e.by), at: e.at }));
  res.json(events);
}
