import { Router } from "express";
import {
  listAdminBlogs,
  getAdminBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  publishBlog,
  scheduleBlog,
  rescheduleBlog,
  unpublishBlog,
} from "../controllers/blogController.js";
import { requireAuth, requireAdminRole, requirePermission } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", requirePermission("blog:view"), listAdminBlogs);
router.get("/:id", requirePermission("blog:view"), getAdminBlogById);
router.post("/", requirePermission("blog:create"), createBlog);
router.put("/:id", requirePermission("blog:create"), updateBlog);
router.delete("/:id", requirePermission("blog:create"), deleteBlog);

// Going live (or scheduling to go live) is deliberately admin-only —
// matches the doc's own Author-vs-Admin split: a content_writer can
// create/edit/submit, only an admin can actually publish. Pulling an
// already-published post back to draft is looser (see unpublishBlog /
// assertCanModify) — a writer retracting their own live post is lower-
// risk than a writer being able to push new content live unreviewed.
router.patch("/:id/publish", requireAdminRole, publishBlog);
router.patch("/:id/schedule", requireAdminRole, scheduleBlog);
// Same authorization as scheduling itself (admin-only) — reschedule is
// just moving an already-scheduled post's publication time, so it
// reuses the exact permission gate scheduleBlog already uses rather
// than introducing a new permission.
router.patch("/:id/reschedule", requireAdminRole, rescheduleBlog);
router.patch("/:id/draft", requirePermission("blog:create"), unpublishBlog);

export default router;
