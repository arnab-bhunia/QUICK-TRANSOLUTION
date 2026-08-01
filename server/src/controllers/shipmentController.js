import Shipment, { SHIPMENT_STATUSES } from "../models/Shipment.js";
import AuditLog from "../models/AuditLog.js";
import { generateTrackingId } from "../utils/trackingId.js";
import { verifyRecaptcha } from "../utils/recaptcha.js";

// Validated BEFORE trackingId ever touches a Mongo query — this is what
// blocks NoSQL-operator injection (e.g. { "$ne": null } sent as the
// "trackingId" field instead of a string). A non-string or malformed
// value is rejected here and never reaches Shipment.findOne().
const TRACKING_ID_REGEX = /^[A-Z0-9]{8,20}$/;

const REQUIRED_FIELDS = [
  "senderName",
  "senderPhone",
  "receiverName",
  "receiverPhone",
  "origin",
  "destination",
];

// Only what a customer needs — never phone numbers, internal Mongo _id,
// createdBy/updatedBy, or anything else that lives on the document.
function publicShape(shipment) {
  return {
    trackingId: shipment.trackingId,
    origin: shipment.origin,
    destination: shipment.destination,
    currentStatus: shipment.currentStatus,
    currentLocation: shipment.currentLocation,
    estimatedDelivery: shipment.estimatedDelivery,
    history: shipment.history,
  };
}

// ---------------------------------------------------------------------------
// PUBLIC
// ---------------------------------------------------------------------------

export async function lookupShipment(req, res) {
  const { trackingId, phoneLast4, recaptchaToken } = req.body;
  const ip = req.ip;

  const recaptchaOk = await verifyRecaptcha(recaptchaToken, ip);
  if (!recaptchaOk) {
    return res.status(400).json({ message: "Verification failed. Please refresh and try again." });
  }

  if (typeof trackingId !== "string" || !TRACKING_ID_REGEX.test(trackingId.toUpperCase().trim())) {
    return res.status(400).json({ message: "Enter a valid tracking ID." });
  }

  const id = trackingId.toUpperCase().trim();
  const shipment = await Shipment.findOne({ trackingId: id });

  if (!shipment) {
    await AuditLog.create({ trackingId: id, action: "lookup_failed", ipAddress: ip });
    return res.status(404).json({ message: "No shipment found for this tracking ID." });
  }

  if (shipment.visibility === "private") {
    const last4 = (shipment.receiverPhone || "").slice(-4);
    const given = typeof phoneLast4 === "string" ? phoneLast4.trim() : "";

    if (!given) {
      // First attempt with no phone supplied yet — tell the frontend to
      // ask for it, don't count this as a failed guess.
      return res.status(403).json({
        message: "This shipment is private. Please verify to continue.",
        needsVerification: true,
      });
    }

    if (given !== last4) {
      await AuditLog.create({
        shipment: shipment._id,
        trackingId: shipment.trackingId,
        action: "lookup_failed",
        ipAddress: ip,
      });
      // Same generic 404 as "doesn't exist" — never confirm that a
      // tracking ID is real just because the phone digits were wrong.
      return res.status(404).json({ message: "No shipment found for this tracking ID." });
    }

    await AuditLog.create({
      shipment: shipment._id,
      trackingId: shipment.trackingId,
      action: "viewed_private",
      ipAddress: ip,
    });
  }

  res.json(publicShape(shipment));
}

// ---------------------------------------------------------------------------
// ADMIN — every route below sits behind requireAuth in routes/track.js
// ---------------------------------------------------------------------------

export async function createShipment(req, res) {
  const missing = REQUIRED_FIELDS.filter((field) => !req.body[field]?.trim?.());
  if (missing.length) {
    return res.status(400).json({ message: `Missing required field(s): ${missing.join(", ")}` });
  }

  const trackingId = await generateTrackingId();

  const shipment = await Shipment.create({
    trackingId,
    visibility: req.body.visibility === "public" ? "public" : "private",
    senderName: req.body.senderName,
    senderPhone: req.body.senderPhone,
    receiverName: req.body.receiverName,
    receiverPhone: req.body.receiverPhone,
    origin: req.body.origin,
    destination: req.body.destination,
    estimatedDelivery: req.body.estimatedDelivery || undefined,
    currentStatus: "booked",
    currentLocation: req.body.origin,
    history: [
      {
        status: "booked",
        location: req.body.origin,
        note: "Shipment booked",
        timestamp: new Date(),
      },
    ],
    createdBy: req.user._id,
  });

  await AuditLog.create({
    shipment: shipment._id,
    trackingId: shipment.trackingId,
    action: "created",
    performedBy: req.user._id,
    ipAddress: req.ip,
    after: shipment.toObject(),
  });

  res.status(201).json({
    message: "Shipment created",
    trackingId: shipment.trackingId,
    id: shipment._id,
  });
}

export async function updateStatus(req, res) {
  const { status, location, note } = req.body;

  if (!SHIPMENT_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const shipment = await Shipment.findOne({
    trackingId: req.params.trackingId.toUpperCase(),
  });
  if (!shipment) {
    return res.status(404).json({ message: "Shipment not found" });
  }

  const before = {
    currentStatus: shipment.currentStatus,
    currentLocation: shipment.currentLocation,
  };

  const resolvedLocation = location?.trim() || shipment.currentLocation;

  shipment.currentStatus = status;
  shipment.currentLocation = resolvedLocation;
  shipment.history.push({
    status,
    location: resolvedLocation,
    note: note?.trim() || "",
    timestamp: new Date(),
  });
  shipment.updatedBy = req.user._id;
  await shipment.save();

  await AuditLog.create({
    shipment: shipment._id,
    trackingId: shipment.trackingId,
    action: "status_updated",
    performedBy: req.user._id,
    ipAddress: req.ip,
    before,
    after: { currentStatus: status, currentLocation: resolvedLocation },
  });

  res.json({ message: "Status updated", trackingId: shipment.trackingId });
}

export async function updateVisibility(req, res) {
  const { visibility } = req.body;
  if (!["public", "private"].includes(visibility)) {
    return res.status(400).json({ message: "Invalid visibility value" });
  }

  const shipment = await Shipment.findOne({
    trackingId: req.params.trackingId.toUpperCase(),
  });
  if (!shipment) {
    return res.status(404).json({ message: "Shipment not found" });
  }

  const before = { visibility: shipment.visibility };
  shipment.visibility = visibility;
  shipment.updatedBy = req.user._id;
  await shipment.save();

  await AuditLog.create({
    shipment: shipment._id,
    trackingId: shipment.trackingId,
    action: "visibility_changed",
    performedBy: req.user._id,
    ipAddress: req.ip,
    before,
    after: { visibility },
  });

  res.json({ message: "Visibility updated", trackingId: shipment.trackingId });
}

export async function listShipments(req, res) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

  const [items, total] = await Promise.all([
    Shipment.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-history"),
    Shipment.countDocuments(),
  ]);

  res.json({ items, total, page, limit });
}

export async function getAudit(req, res) {
  const shipment = await Shipment.findOne({
    trackingId: req.params.trackingId.toUpperCase(),
  });
  if (!shipment) {
    return res.status(404).json({ message: "Shipment not found" });
  }

  const logs = await AuditLog.find({ shipment: shipment._id })
    .sort({ createdAt: -1 })
    .populate("performedBy", "name email");

  res.json(logs);
}
