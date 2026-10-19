import { Router } from "express";
import {
  listOffices,
  listOfficeOptions,
  getOffice,
  createOffice,
  updateOffice,
  deactivateOffice,
  reactivateOffice,
  getOfficeHistory,
} from "../controllers/officeController.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();

// "offices:manage" is deliberately not listed under any role in
// config/permissions.js: only admin holds it, via the "*" wildcard. HR and
// every other role are denied unless that static file is edited later.
//
// Registered BEFORE the router-wide guard: a read-only list of active offices
// (code + name) for the staff-creation dropdown, available to anyone who can
// create staff (team:create_staff). It grants no office-management rights.
router.get("/options", requireAuth, requirePermission("team:create_staff"), listOfficeOptions);

router.use(requireAuth, requirePermission("offices:manage"));

router.get("/", listOffices);
router.post("/", createOffice);
router.get("/:code", getOffice);
router.get("/:code/history", getOfficeHistory);
router.patch("/:code", updateOffice);
router.patch("/:code/deactivate", deactivateOffice);
router.patch("/:code/reactivate", reactivateOffice);

export default router;
