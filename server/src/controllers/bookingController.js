import BookingRequest, { BOOKING_STATUSES } from "../models/BookingRequest.js";

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

  const [items, total] = await Promise.all([
    BookingRequest.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("customer", "name email phone"),
    BookingRequest.countDocuments(),
  ]);

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
