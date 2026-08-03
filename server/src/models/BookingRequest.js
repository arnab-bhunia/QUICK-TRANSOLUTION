import mongoose from "mongoose";

export const BOOKING_STATUSES = ["pending", "contacted", "converted", "rejected"];

const bookingRequestSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    origin: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    cargoDetails: { type: String, required: true, trim: true },
    preferredDate: { type: Date },
    notes: { type: String, trim: true, default: "" },
    // Staff will move this along via the admin dashboard (next build).
    status: { type: String, enum: BOOKING_STATUSES, default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("BookingRequest", bookingRequestSchema);
