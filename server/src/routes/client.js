import { Router } from "express";
import { signup, login, logout, me, verifyEmail, resendOtp } from "../controllers/clientAuthController.js";
import {
  createBooking,
  listMyBookings,
  listAllBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { requireClientAuth } from "../middleware/clientAuth.js";
import { requireAuth } from "../middleware/auth.js";
import { loginLimiter, signupLimiter, otpLimiter } from "../middleware/rateLimiters.js";

const router = Router();

// Customer-facing
router.post("/signup", signupLimiter, signup);
router.post("/verify-email", otpLimiter, verifyEmail);
router.post("/resend-otp", otpLimiter, resendOtp);
router.post("/login", loginLimiter, login);
router.post("/logout", requireClientAuth, logout);
router.get("/me", requireClientAuth, me);

router.post("/bookings", requireClientAuth, createBooking);
router.get("/bookings", requireClientAuth, listMyBookings);

// Staff-facing — reviewing incoming booking requests
router.get("/admin/bookings", requireAuth, listAllBookings);
router.patch("/admin/bookings/:id/status", requireAuth, updateBookingStatus);

export default router;
