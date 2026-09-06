import mongoose from "mongoose";

// ============================================================================
// BLOG
// Two content types share one schema (contentType discriminates them)
// rather than two separate models — a blog listing/search/filter query
// needs to treat both uniformly, and they share far more fields
// (title, slug, category, tags, SEO, status) than they differ on.
//
// Images/PDFs: only the URL + metadata are stored here, never the file
// itself — the actual binary lives in Cloudinary (see utils/storage.js).
// Keeps MongoDB documents small and fast regardless of how large the
// uploaded files are.
// ============================================================================

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    // Cloudinary public_id — needed to actually delete this asset from
    // storage later (see utils/storage.js deleteFromCloudinary). Field
    // name kept as "key" for continuity with documents created back
    // when storage was Cloudflare R2 (an R2 object key); those older
    // documents' "key" values are R2 keys, not Cloudinary public_ids,
    // so they won't resolve on Cloudinary — see the storage-migration
    // notes in utils/storage.js before deleting/replacing very old media.
    key: { type: String, default: null },
    alt: { type: String, trim: true, maxlength: 200, default: "" },
  },
  { _id: false }
);

const pdfSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    key: { type: String, default: null }, // same rationale as imageSchema.key above
    fileName: { type: String, trim: true, maxlength: 200 },
    size: { type: Number }, // bytes
  },
  { _id: false }
);

const seoSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, trim: true, maxlength: 70, default: "" },
    metaDescription: { type: String, trim: true, maxlength: 160, default: "" },
    // Deliberately kept as a plain String (not upgraded to an object)
    // so any existing document, and any existing code that reads
    // seo.ogImage as a URL string, keeps working with zero migration.
    // The Cloudinary public_id lives in a separate sibling field instead.
    ogImage: { type: String, trim: true, default: "" },
    ogImageKey: { type: String, default: null },
    canonicalUrl: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    // Every slug this post has EVER had while published/scheduled (not
    // including its current one). Lets an old, previously-shared/
    // indexed URL keep working after a title edit changes the slug,
    // instead of silently 404ing. See controllers/blogController.js
    // getPublicBlogBySlug. Defaults to [] so existing documents render
    // exactly as before with no migration needed.
    previousSlugs: { type: [String], default: [] },

    contentType: { type: String, enum: ["article", "pdf"], required: true },

    excerpt: { type: String, trim: true, maxlength: 300, default: "" },
    featuredImage: { type: imageSchema, default: null },

    // Tiptap's structured JSON document (article type only). Stored as
    // Mixed rather than a strict sub-schema — Tiptap's own node/mark
    // shape can evolve (new block types, extensions) without needing a
    // matching Mongoose schema migration every time.
    content: { type: mongoose.Schema.Types.Mixed, default: null },

    // pdf type only
    pdf: { type: pdfSchema, default: null },

    category: { type: String, trim: true, maxlength: 60, default: "" },
    tags: { type: [String], default: [] },

    author: {
      name: { type: String, trim: true, default: "Quick Transolution" },
    },
    // Who can edit/delete this post — see controllers/blogController.js.
    // Distinct from `author.name` (a display label) — this is the real
    // access-control reference, an actual AdminUser account.
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", required: true },

    status: { type: String, enum: ["draft", "scheduled", "published"], default: "draft" },
    scheduledFor: { type: Date, default: null }, // only meaningful when status === "scheduled"
    publishedAt: { type: Date, default: null },

    featured: { type: Boolean, default: false },

    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// Every public listing/detail query filters by status + sorts by
// publishedAt — a compound index keeps that fast as the collection
// grows, rather than degrading once there are hundreds of posts.
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ tags: 1 });
// Supports the old-URL fallback lookup in getPublicBlogBySlug — a
// direct equality match against the array is efficient with a plain
// index (MongoDB indexes each array element individually).
blogSchema.index({ previousSlugs: 1 });
// Lightweight text search across title/excerpt/tags for the search box
// (Phase 5) — avoids needing a separate search service for a blog at
// this scale.
blogSchema.index({ title: "text", excerpt: "text", tags: "text" });

export default mongoose.model("Blog", blogSchema);