import mongoose from "mongoose";

const chatQuerySchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    contact: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["open", "answered"],
      default: "open",
    },
    reply: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("ChatQuery", chatQuerySchema);
