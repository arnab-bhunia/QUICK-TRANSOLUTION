import BookingRequest, { BOOKING_STATUSES } from "../models/BookingRequest.js";
import { decryptField } from "../utils/crypto.js";

const REQUIRED_FIELDS = ["origin", "destination", "cargoDetails"];

export async function createBooking(req, res) {
  const missing = REQUIRED_FIELDS.filter((field) => !req.body[field]?.trim?.());
  if (missing.length) {
    return res.status(400).json({ message: `Missing required field(s): ${missing.join(", ")}` });
  }

  const booking = await BookingRequest.create({
    customer: req.customer._id,
    origin: req.body.origin.trim(),
    destination: req.body.destination.trim(),
    cargoDetails: req.body.cargoDetails.trim(),
    preferredDate: req.body.preferredDate || undefined,
    notes: req.body.notes?.trim() || "",
  });

  res.status(201).json(booking);
}

export async function listMyBookings(req, res) {
  const bookings = await BookingRequest.find({ customer: req.customer._id }).sort({
    createdAt: -1,
  });
  res.json(bookings);
}

// ---------------------------------------------------------------------------
// STAFF — behind requireAuth in routes/client.js
// ---------------------------------------------------------------------------

export async function listAllBookings(req, res) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

  const [rawItems, total] = await Promise.all([
    BookingRequest.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("customer", "name email encryptedPhone"),
    BookingRequest.countDocuments(),
  ]);

  // Customer.phone is stored encrypted (see models/Customer.js) — decrypt
  // it here for staff review, same as it always displayed in plain text
  // before encryption was added. Never sent back to the customer-facing
  // side of the API, only this staff-only listing.
  const items = rawItems.map((booking) => {
    const obj = booking.toObject();
    if (obj.customer) {
      obj.customer.phone = decryptField(obj.customer.encryptedPhone);
      delete obj.customer.encryptedPhone;
    }
    return obj;
  });

  res.json({ items, total, page, limit });
}

export async function updateBookingStatus(req, res) {
  const { status } = req.body;
  if (!BOOKING_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const booking = await BookingRequest.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: "Booking request not found" });
  }

  booking.status = status;
  await booking.save();

  res.json(booking);
}
