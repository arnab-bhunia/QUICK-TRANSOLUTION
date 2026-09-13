import { Router } from "express";
import {
  listJobOptionsAdmin,
  listAdminJobs,
  getAdminJobById,
  createJob,
  updateJob,
  deleteJob,
  publishJob,
  closeJob,
  archiveJob,
  duplicateJob,
} from "../controllers/jobController.js";
import {
  listAdminApplications,
  getAdminApplicationById,
  updateApplicationStatusAdmin,
  addApplicationNoteAdmin,
  getApplicationResumeAdmin,
  exportApplicationsAdmin,
} from "../controllers/jobApplicationController.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

// --- Jobs -----------------------------------------------------------------
router.get("/jobs/options", requirePermission("careers:view"), listJobOptionsAdmin);
router.get("/jobs", requirePermission("careers:view"), listAdminJobs);
router.get("/jobs/:id", requirePermission("careers:view"), getAdminJobById);
router.post("/jobs", requirePermission("careers:manage_jobs"), createJob);
router.put("/jobs/:id", requirePermission("careers:manage_jobs"), updateJob);
router.delete("/jobs/:id", requirePermission("careers:manage_jobs"), deleteJob);
router.patch("/jobs/:id/publish", requirePermission("careers:manage_jobs"), publishJob);
router.patch("/jobs/:id/close", requirePermission("careers:manage_jobs"), closeJob);
router.patch("/jobs/:id/archive", requirePermission("careers:manage_jobs"), archiveJob);
router.post("/jobs/:id/duplicate", requirePermission("careers:manage_jobs"), duplicateJob);

// --- Applications -----------------------------------------------------------
// "/export" is registered before "/:id" so it isn't swallowed by the id
// param route — same convention as routes/serviceEnquiries.js "/counts".
router.get(
  "/applications/export",
  requirePermission("careers:export_applications"),
  exportApplicationsAdmin
);
router.get(
  "/applications",
  requirePermission("careers:view_applications"),
  listAdminApplications
);
router.get(
  "/applications/:id",
  requirePermission("careers:view_applications"),
  getAdminApplicationById
);
router.get(
  "/applications/:id/resume",
  requirePermission("careers:download_resume"),
  getApplicationResumeAdmin
);
router.patch(
  "/applications/:id/status",
  requirePermission("careers:manage_applications"),
  updateApplicationStatusAdmin
);
router.post(
  "/applications/:id/notes",
  requirePermission("careers:notes"),
  addApplicationNoteAdmin
);

export default router;
