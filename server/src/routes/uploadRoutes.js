import { Router } from "express";
import { uploadImage, uploadPdf } from "../controllers/uploadController.js";
import { imageUpload, pdfUpload, handleUploadError } from "../middleware/uploadValidation.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import { uploadLimiter } from "../middleware/rateLimiters.js";

const router = Router();

// Gate: "blog:create" — the same permission that already lets a
// content_writer create/edit their own blog post (see
// config/permissions.js: content_writer has blog:create, blog:edit_own,
// blog:view). Reviewed for #42: this endpoint is intentionally NOT tied
// to a specific blog ID (a new post's image/PDF has to be uploaded
// before the post itself exists, so there's no blog document yet to
// check ownership against), so it can't perform a per-blog ownership
// check here even if we wanted to.
//
// "blog:create" is the right gate rather than adding a new
// blog:upload / blog:upload_own permission: any account that can create
// or edit a blog already legitimately needs to be able to upload media
// for it, and no account without blog:create (e.g. hr, manager, staff)
// can reach this route at all. It does NOT grant anything broader —
// admin-only actions (publish, schedule, featured) are gated
// separately by requireAdminRole / an explicit role check, not by this
// permission, so an upload-capable content_writer still can't touch
// those. The only residual limitation: a content_writer with blog:create
// could technically call this endpoint without an accompanying
// create/edit of a blog they own — accepted here as the documented
// trade-off of keeping uploads decoupled from a specific blog ID, same
// as the existing architecture.
router.use(requireAuth, requirePermission("blog:create"), uploadLimiter);

router.post("/image", imageUpload, handleUploadError, uploadImage);
router.post("/pdf", pdfUpload, handleUploadError, uploadPdf);

export default router;
