import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    origin: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    weight: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Quote", quoteSchema);
