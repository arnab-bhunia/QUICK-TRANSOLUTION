import mongoose from "mongoose";

// Mongoose queues ("buffers") queries and waits up to 10s for a
// connection before giving up with an ugly internal timeout message.
// Checking readyState up front turns that 10-second hang into an
// instant, clean response instead.
export function requireDbReady(req, res, next) {
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  return res.status(503).json({
    message: "Service temporarily unavailable. Please try again in a moment.",
  });
}