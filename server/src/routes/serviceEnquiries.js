import { Router } from "express";
import {
  createServiceEnquiry,
  listServiceEnquiriesAdmin,
} from "../controllers/serviceEnquiryController.js";
import { requireAuth } from "../middleware/auth.js";
import { enquiryLimiter } from "../middleware/rateLimiters.js";

const router = Router();

// Public — open to guests and logged-in customers alike. Whether the
// submitter is logged in is determined server-side from their session
// cookie inside the controller, never trusted from the request body.
router.post("/", enquiryLimiter, createServiceEnquiry);

// Staff-only (any staff role, not admin-only — reviewing enquiries is
// day-to-day operational work, similar to booking review rather than
// staff/analytics management which stays admin-role-gated elsewhere).
router.get("/", requireAuth, listServiceEnquiriesAdmin);

export default router;
