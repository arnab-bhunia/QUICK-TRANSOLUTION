import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    mobile: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Subscriber", subscriberSchema);
