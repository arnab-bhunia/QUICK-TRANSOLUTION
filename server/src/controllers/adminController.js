import bcrypt from "bcryptjs";
import AdminUser from "../models/AdminUser.js";
import Shipment from "../models/Shipment.js";
import BookingRequest from "../models/BookingRequest.js";
import AuditLog from "../models/AuditLog.js";

// ---------------------------------------------------------------------------
// STAFF MANAGEMENT — creating staff/admin accounts from inside the app,
// instead of only via the create-admin CLI script. Still no public
// signup: only an already-authenticated admin can reach these routes.
// ---------------------------------------------------------------------------

export async function listStaff(req, res) {
  const staff = await AdminUser.find().select("-passwordHash").sort({ createdAt: -1 });
  res.json(staff);
}

export async function createStaff(req, res) {
  const { name, email, password, role } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }
  if (!["admin", "staff"].includes(role)) {
    return res.status(400).json({ message: "Role must be 'admin' or 'staff'" });
  }

  const existing = await AdminUser.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(409).json({ message: "An account with this email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await AdminUser.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    role,
  });

  res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
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
