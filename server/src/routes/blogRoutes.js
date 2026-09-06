import { Router } from "express";
import { listPublicBlogs, getPublicBlogBySlug } from "../controllers/blogController.js";

const router = Router();

// GET /api/blogs?page=1&category=Technology&tag=GPS&search=logistics
// Category/tag/search are all query params on one endpoint rather than
// separate routes (e.g. /category/:category) — a public blog listing
// needs to combine these filters together in practice (e.g. search
// within a category), which is simpler as one endpoint with optional
// params than as several single-purpose routes that can't compose.
router.get("/", listPublicBlogs);
router.get("/:slug", getPublicBlogBySlug);

export default router;
