import { Router } from "express";
import { login, logout, me, changePassword } from "../controllers/authController.js";
import { listStaff, createStaff, getAnalytics, listManagers } from "../controllers/adminController.js";
import { requireAuth, requireAdminRole } from "../middleware/auth.js";
import { loginLimiter } from "../middleware/rateLimiters.js";

const router = Router();

router.post("/login", loginLimiter, login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);
router.patch("/change-password", requireAuth, changePassword);

// Admin-only — staff management + analytics dashboard
router.get("/staff", requireAuth, requireAdminRole, listStaff);
router.post("/staff", requireAuth, requireAdminRole, createStaff);
router.get("/managers", requireAuth, requireAdminRole, listManagers);
router.get("/analytics", requireAuth, requireAdminRole, getAnalytics);

export default router;
