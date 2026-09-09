import { Router } from "express";
import {
  createServiceEnquiry,
  listServiceEnquiriesAdmin,
  getServiceEnquiryCountsAdmin,
  getServiceEnquiryAdmin,
  getServiceEnquiryHistoryAdmin,
  updateServiceEnquiryStatusAdmin,
  sendServiceEnquiryEmailAdmin,
  getActiveServiceEnquiryEmailOperationAdmin,
  resolveServiceEnquiryEmailOperationAdmin,
} from "../controllers/serviceEnquiryController.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import { enquiryLimiter } from "../middleware/rateLimiters.js";

const router = Router();

// Public — open to guests and logged-in customers alike. Whether the
// submitter is logged in is determined server-side from their session
// cookie inside the controller, never trusted from the request body.
router.post("/", enquiryLimiter, createServiceEnquiry);

// --- Admin (staff) — every route below is gated on BOTH authentication
// AND a specific Service Enquiry permission (see config/permissions.js).
// Hiding the tab/buttons in React is not the security boundary — this
// is. "/counts" is registered before "/:id" so it isn't swallowed by
// the id param route.
router.get(
  "/counts",
  requireAuth,
  requirePermission("service_enquiries:view"),
  getServiceEnquiryCountsAdmin
);
router.get("/", requireAuth, requirePermission("service_enquiries:view"), listServiceEnquiriesAdmin);
router.get(
  "/:id",
  requireAuth,
  requirePermission("service_enquiries:view"),
  getServiceEnquiryAdmin
);
router.get(
  "/:id/history",
  requireAuth,
  requirePermission("service_enquiries:view"),
  getServiceEnquiryHistoryAdmin
);
router.patch(
  "/:id/status",
  requireAuth,
  requirePermission("service_enquiries:contact"),
  updateServiceEnquiryStatusAdmin
);
router.post(
  "/:id/email",
  requireAuth,
  requirePermission("service_enquiries:email"),
  sendServiceEnquiryEmailAdmin
);
// Lets the UI check for an in-progress send BEFORE opening the composer
// (see EmailComposer.jsx) — read-only, so it only needs the view
// permission, not the email-send permission.
router.get(
  "/:id/email/active",
  requireAuth,
  requirePermission("service_enquiries:view"),
  getActiveServiceEnquiryEmailOperationAdmin
);
// Manual recovery for an UNKNOWN operation — same permission as sending,
// since resolving one is effectively deciding whether a send happened.
router.post(
  "/:id/email/:emailId/resolve",
  requireAuth,
  requirePermission("service_enquiries:email"),
  resolveServiceEnquiryEmailOperationAdmin
);

export default router;
