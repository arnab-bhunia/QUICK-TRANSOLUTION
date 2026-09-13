import { Router } from "express";
import { listPublicJobs, getPublicJobBySlug } from "../controllers/jobController.js";
import { submitJobApplication } from "../controllers/jobApplicationController.js";
import { resumeUpload } from "../middleware/careersUpload.js";
import { handleUploadError } from "../middleware/uploadValidation.js";
import { careersApplyLimiter } from "../middleware/rateLimiters.js";

const router = Router();

// GET /api/careers/jobs?page=1&department=...&employmentType=...&workMode=...&search=...
router.get("/jobs", listPublicJobs);
router.get("/jobs/:slug", getPublicJobBySlug);

// Public — open to guests and logged-in customers alike, exactly like
// POST /api/service-enquiries. No account/login required (spec section
// 2); whether the submitter happens to be a logged-in customer is
// resolved server-side from their session cookie, never trusted from
// the request body.
router.post(
  "/jobs/:slug/apply",
  careersApplyLimiter,
  resumeUpload,
  handleUploadError,
  submitJobApplication
);

export default router;
