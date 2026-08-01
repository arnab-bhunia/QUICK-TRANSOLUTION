import mongoose from "mongoose";

export const SHIPMENT_STATUSES = [
  "booked",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "on_hold",
];

// Customer-facing status timeline. This is intentionally separate from
// AuditLog — this array is what the public /track page renders, so it
// only ever holds status/location/note, never phone numbers, IPs, or
// which staff member made the change.
const historyEntrySchema = new mongoose.Schema(
  {
    status: { type: String, enum: SHIPMENT_STATUSES, required: true },
    location: { type: String, trim: true, default: "" },
    note: { type: String, trim: true, default: "" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const shipmentSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    // Private shipments require the receiver's phone (last 4 digits) in
    // addition to the tracking ID before details are returned publicly.
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
    senderName: { type: String, required: true, trim: true },
    senderPhone: { type: String, required: true, trim: true },
    receiverName: { type: String, required: true, trim: true },
    receiverPhone: { type: String, required: true, trim: true },
    origin: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    currentStatus: {
      type: String,
      enum: SHIPMENT_STATUSES,
      default: "booked",
    },
    currentLocation: { type: String, trim: true, default: "" },
    estimatedDelivery: { type: Date },
    history: { type: [historyEntrySchema], default: [] },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true }
);

export default mongoose.model("Shipment", shipmentSchema);
