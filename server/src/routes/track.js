import { Router } from "express";
import {
  lookupShipment,
  createShipment,
  updateStatus,
  updateVisibility,
  listShipments,
  getAudit,
} from "../controllers/shipmentController.js";
import { requireAuth } from "../middleware/auth.js";
import { trackLookupLimiter } from "../middleware/rateLimiters.js";

const router = Router();

// Public
router.post("/lookup", trackLookupLimiter, lookupShipment);

// Admin — every route below requires a logged-in staff session
router.post("/", requireAuth, createShipment);
router.get("/admin", requireAuth, listShipments);
router.patch("/:trackingId/status", requireAuth, updateStatus);
router.patch("/:trackingId/visibility", requireAuth, updateVisibility);
router.get("/:trackingId/audit", requireAuth, getAudit);

export default router;
