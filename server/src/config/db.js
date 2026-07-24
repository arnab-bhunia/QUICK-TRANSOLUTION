import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sugam_group";

  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.error(
      "The API will keep running, but requests that touch the database will fail until MongoDB is reachable."
    );
  }
}
