import { Router } from "express";
import { requireAuth, requireAdminRole } from "../middleware/auth.js";
import { analyticsOverview, analyticsExplorer, analyticsReport, analyticsExplorerExport } from "../controllers/analyticsController.js";

const router = Router();
// Analytics is intentionally admin-only for the first release. The API is
// the security boundary; hiding a client-side tab is never considered access control.
router.get("/overview", requireAuth, requireAdminRole, analyticsOverview);
router.get("/explorer", requireAuth, requireAdminRole, analyticsExplorer);
router.get("/explorer/export", requireAuth, requireAdminRole, analyticsExplorerExport);
router.get("/reports/:report", requireAuth, requireAdminRole, analyticsReport);

export default router;
