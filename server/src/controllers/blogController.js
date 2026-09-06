import Blog from "../models/Blog.js";
import { generateUniqueSlug } from "../utils/slugify.js";
import { safeDeleteFromCloudinary } from "../utils/storage.js";
import { promoteDueScheduledPosts } from "../utils/blogPublication.js";

const PUBLIC_LIST_LIMIT = 12;
const RELATED_LIMIT = 3;

// Fields safe to send to the public — never leaks createdBy (an
// internal AdminUser reference) or the raw Tiptap content on list views
// (only the full article page needs the whole document body).
const PUBLIC_LIST_FIELDS =
  "title slug contentType excerpt featuredImage category tags author status publishedAt featured createdAt";

function buildOwnershipFilter(user) {
  // admin: no restriction. content_writer: only ever their own posts.
  if (user.role === "admin") return {};
  return { createdBy: user._id };
}

function assertCanModify(user, blog) {
  if (user.role === "admin") return;
  if (String(blog.createdBy) !== String(user._id)) {
    const err = new Error("You can only modify your own articles.");
    err.status = 403;
    throw err;
  }
}

// =============================================================================
// PUBLIC
// =============================================================================

export async function listPublicBlogs(req, res) {
  // The background scheduler (utils/blogScheduler.js) is now the real
  // mechanism for promoting due scheduled posts — it runs independently
  // of any visitor. This call is kept as a cheap, harmless extra safety
  // net (e.g. covers the scheduler's periodic-interval gap, or a moment
  // right at process start before the DB connection is ready): the
  // shared promotion query is a no-op the instant nothing is due, so
  // there's no real cost to leaving it here too.
  await promoteDueScheduledPosts();

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || PUBLIC_LIST_LIMIT, 50);
  const { category, tag, search } = req.query;

  const query = { status: "published" };
  if (category) query.category = category;
  if (tag) query.tags = tag;
  if (search?.trim()) query.$text = { $search: search.trim() };

  const [items, total, featured] = await Promise.all([
    Blog.find(query)
      .select(PUBLIC_LIST_FIELDS)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Blog.countDocuments(query),
    // Only shown on page 1 with no active filters — a "featured" banner
    // doesn't make sense in the middle of a filtered/searched result set.
    page === 1 && !category && !tag && !search
      ? Blog.findOne({ status: "published", featured: true })
          .select(PUBLIC_LIST_FIELDS)
          .sort({ publishedAt: -1 })
      : null,
  ]);

  res.json({
    items,
    featured: featured || null,
    page,
    totalPages: Math.max(Math.ceil(total / limit), 1),
    total,
  });
}

export async function getPublicBlogBySlug(req, res) {
  // See the comment in listPublicBlogs above — same reasoning.
  await promoteDueScheduledPosts();

  let blog = await Blog.findOne({ slug: req.params.slug, status: "published" });

  // Not found under the requested slug — it may be an OLD slug for a
  // post that's since had its title (and therefore slug) changed. Old,
  // previously-shared/indexed URLs should keep working rather than
  // silently 404ing; the response tells the frontend the real current
  // slug so it can update the address bar (see BlogDetails.jsx), but
  // this endpoint never redirects itself — that's a client-routing
  // concern in this SPA, not a server-side HTTP redirect.
  if (!blog) {
    blog = await Blog.findOne({ previousSlugs: req.params.slug, status: "published" });
  }

  if (!blog) {
    return res.status(404).json({ message: "Article not found." });
  }

  const related = await Blog.find({
    _id: { $ne: blog._id },
    status: "published",
    $or: [{ category: blog.category }, { tags: { $in: blog.tags } }],
  })
    .select(PUBLIC_LIST_FIELDS)
    .sort({ publishedAt: -1 })
    .limit(RELATED_LIMIT);

  // Always the blog's actual current slug — identical to req.params.slug
  // when the request already used the canonical URL, different when it
  // came in via an old slug. The frontend compares the two to decide
  // whether a client-side redirect is needed.
  res.json({ blog, related, canonicalSlug: blog.slug });
}

// =============================================================================
// ADMIN
// =============================================================================

export async function listAdminBlogs(req, res) {
  const requester = req.user;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const { status, category, search } = req.query;

  const query = { ...buildOwnershipFilter(requester) };
  if (status) query.status = status;
  if (category) query.category = category;
  if (search?.trim()) query.$text = { $search: search.trim() };

  const [items, total] = await Promise.all([
    Blog.find(query)
      .select("-content") // list view never needs the full article body
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Blog.countDocuments(query),
  ]);

  res.json({ items, page, totalPages: Math.max(Math.ceil(total / limit), 1), total });
}

export async function getAdminBlogById(req, res) {
  const blog = await Blog.findOne({ _id: req.params.id, ...buildOwnershipFilter(req.user) });
  if (!blog) {
    return res.status(404).json({ message: "Blog post not found." });
  }
  res.json(blog);
}

export async function createBlog(req, res) {
  const requester = req.user;
  const {
    title,
    contentType,
    excerpt,
    featuredImage,
    content,
    pdf,
    category,
    tags,
    authorName,
    seo,
  } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Title is required." });
  }
  if (!["article", "pdf"].includes(contentType)) {
    return res.status(400).json({ message: "Content type must be 'article' or 'pdf'." });
  }
  if (contentType === "pdf" && !pdf?.url) {
    return res.status(400).json({ message: "A PDF file is required for a PDF publication." });
  }

  const slug = await generateUniqueSlug(title);

  let blog;
  try {
    blog = await Blog.create({
      title: title.trim(),
      slug,
      contentType,
      excerpt: excerpt?.trim().slice(0, 300) || "",
      featuredImage: featuredImage?.url ? featuredImage : null,
      content: contentType === "article" ? content ?? null : null,
      pdf: contentType === "pdf" ? pdf : null,
      category: category?.trim().slice(0, 60) || "",
      tags: Array.isArray(tags) ? tags.map((t) => String(t).trim().slice(0, 40)).filter(Boolean) : [],
      author: { name: authorName?.trim() || requester.name },
      createdBy: requester._id,
      status: "draft", // every post starts as a draft — publish/schedule are separate, deliberate actions
      seo: {
        metaTitle: seo?.metaTitle?.trim().slice(0, 70) || "",
        metaDescription: seo?.metaDescription?.trim().slice(0, 160) || "",
        ogImage: seo?.ogImage || "",
        ogImageKey: seo?.ogImageKey || null,
        canonicalUrl: seo?.canonicalUrl || "",
      },
    });
  } catch (err) {
    // The image/PDF/OG-image (if any) were already uploaded to Cloudinary
    // via the separate upload endpoints, BEFORE this request — if the
    // blog document itself failed to save, those assets are now orphaned
    // with nothing in the database referencing them. Clean them up
    // rather than leaving dead files sitting in the account forever.
    await safeDeleteFromCloudinary(featuredImage?.key, "image");
    await safeDeleteFromCloudinary(pdf?.key, "raw");
    await safeDeleteFromCloudinary(seo?.ogImageKey, "image");
    throw err;
  }

  res.status(201).json(blog);
}

export async function updateBlog(req, res) {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(404).json({ message: "Blog post not found." });
  }
  assertCanModify(req.user, blog);

  const { title, excerpt, featuredImage, content, pdf, category, tags, authorName, seo, featured } =
    req.body;

  // #48 validation, checked early (before anything else is mutated) so
  // an invalid request exits cleanly with the actual reason — matching
  // the style of the other input-validation checks in createBlog above,
  // rather than a thrown error that the generic error handler would
  // turn into an opaque "something went wrong" for the admin.
  const wantsFeatured = featured !== undefined && req.user.role === "admin" ? Boolean(featured) : undefined;
  if (wantsFeatured === true && blog.status !== "published") {
    return res.status(400).json({ message: "Only a published article can be marked as featured." });
  }

  // Keys of whatever media is CURRENTLY attached, before this edit
  // touches anything — needed below to know what becomes safe to
  // delete from Cloudinary only after the save actually succeeds.
  const oldFeaturedImageKey = blog.featuredImage?.key || null;
  const oldPdfKey = blog.pdf?.key || null;
  const oldOgImageKey = blog.seo?.ogImageKey || null;

  if (title?.trim() && title.trim() !== blog.title) {
    const newSlug = await generateUniqueSlug(title, { excludeId: blog._id });
    // Only published/scheduled posts need their old URL protected — a
    // draft has never been publicly visible/indexed under its slug, so
    // there's no external link that could break (matches "for drafts,
    // normal slug-generation behavior may remain unchanged").
    if (blog.status !== "draft" && blog.slug !== newSlug) {
      blog.previousSlugs = Array.from(new Set([...(blog.previousSlugs || []), blog.slug]));
    }
    blog.title = title.trim();
    blog.slug = newSlug;
  }
  if (excerpt !== undefined) blog.excerpt = excerpt.trim().slice(0, 300);
  if (featuredImage !== undefined) blog.featuredImage = featuredImage?.url ? featuredImage : null;
  if (content !== undefined) blog.content = content;
  if (pdf !== undefined) blog.pdf = pdf;
  if (category !== undefined) blog.category = category.trim().slice(0, 60);
  if (Array.isArray(tags)) blog.tags = tags.map((t) => String(t).trim().slice(0, 40)).filter(Boolean);
  if (authorName !== undefined) blog.author.name = authorName.trim() || blog.author.name;
  if (seo) {
    blog.seo = {
      metaTitle: seo.metaTitle?.trim().slice(0, 70) ?? blog.seo.metaTitle,
      metaDescription: seo.metaDescription?.trim().slice(0, 160) ?? blog.seo.metaDescription,
      ogImage: seo.ogImage ?? blog.seo.ogImage,
      ogImageKey: seo.ogImageKey !== undefined ? seo.ogImageKey : blog.seo.ogImageKey,
      canonicalUrl: seo.canonicalUrl ?? blog.seo.canonicalUrl,
    };
  }
  // Only an admin can toggle the single site-wide "featured" post —
  // otherwise any content_writer could feature their own draft-turned-
  // published article ahead of everyone else's. Validity (must be
  // published to become featured) was already checked above.
  //
  // V1 invariant: at most ONE blog is ever featured. Enforced here
  // rather than a unique index, since "at most one true" isn't
  // expressible as a normal Mongo unique index without a partial-index
  // workaround; a flag + a post-save cleanup query keeps this simple.
  if (wantsFeatured !== undefined) {
    blog.featured = wantsFeatured;
  }

  const newFeaturedImageKey = blog.featuredImage?.key || null;
  const newPdfKey = blog.pdf?.key || null;
  const newOgImageKey = blog.seo?.ogImageKey || null;

  try {
    await blog.save();
  } catch (err) {
    // Save failed — the OLD media reference is still what's actually
    // stored (nothing changed in the database), so it must NOT be
    // touched. But if this edit introduced a brand-new upload that
    // never ended up persisted anywhere, that new object is now
    // orphaned — clean up only that, and only if it's genuinely new.
    if (newFeaturedImageKey && newFeaturedImageKey !== oldFeaturedImageKey) {
      await safeDeleteFromCloudinary(newFeaturedImageKey, "image");
    }
    if (newPdfKey && newPdfKey !== oldPdfKey) {
      await safeDeleteFromCloudinary(newPdfKey, "raw");
    }
    if (newOgImageKey && newOgImageKey !== oldOgImageKey) {
      await safeDeleteFromCloudinary(newOgImageKey, "image");
    }
    throw err;
  }

  // Save succeeded — the new media (if any) is now the persisted
  // reference, so it's finally safe to delete whatever it replaced.
  if (newFeaturedImageKey !== oldFeaturedImageKey) {
    await safeDeleteFromCloudinary(oldFeaturedImageKey, "image");
  }
  if (newPdfKey !== oldPdfKey) {
    await safeDeleteFromCloudinary(oldPdfKey, "raw");
  }
  if (newOgImageKey !== oldOgImageKey) {
    await safeDeleteFromCloudinary(oldOgImageKey, "image");
  }

  // This post is now the featured one and its own save already
  // succeeded — safe to strip `featured` from every other post so
  // exactly one stays true. Done after (not before) this document's
  // own save so a failed save never leaves the site with zero featured
  // posts.
  if (wantsFeatured === true) {
    await Blog.updateMany({ _id: { $ne: blog._id }, featured: true }, { $set: { featured: false } });
  }

  res.json(blog);
}

export async function deleteBlog(req, res) {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(404).json({ message: "Blog post not found." });
  }
  assertCanModify(req.user, blog);

  // A content_writer can delete their own drafts, but not something
  // already scheduled or live — that requires an admin, same principle
  // as why they can't self-publish in the first place.
  if (req.user.role !== "admin" && blog.status !== "draft") {
    return res.status(403).json({
      message: "Only an admin can delete a scheduled or published article.",
    });
  }

  // Media cleanup happens BEFORE removing the Mongo document — but a
  // failure here (already-missing asset, brief Cloudinary outage) must
  // never block the actual deletion the admin asked for.
  // safeDeleteFromCloudinary swallows/logs any error instead of throwing.
  await safeDeleteFromCloudinary(blog.featuredImage?.key, "image");
  await safeDeleteFromCloudinary(blog.pdf?.key, "raw");
  await safeDeleteFromCloudinary(blog.seo?.ogImageKey, "image");

  await blog.deleteOne();
  res.json({ message: "Blog post deleted." });
}

// --- Publish workflow — admin-only, enforced at the route level too ---

export async function publishBlog(req, res) {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(404).json({ message: "Blog post not found." });
  }
  blog.status = "published";
  blog.scheduledFor = null;
  blog.publishedAt = blog.publishedAt || new Date();
  await blog.save();
  res.json(blog);
}

export async function scheduleBlog(req, res) {
  const { scheduledFor } = req.body;
  const date = new Date(scheduledFor);
  if (!scheduledFor || Number.isNaN(date.getTime()) || date <= new Date()) {
    return res.status(400).json({ message: "Please provide a valid future date/time." });
  }

  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(404).json({ message: "Blog post not found." });
  }
  blog.status = "scheduled";
  blog.scheduledFor = date;
  blog.publishedAt = null;
  // A scheduled (not-yet-live) post can't remain the public featured
  // article — nothing would be at that slug for a visitor to see.
  // Keeps the "featured implies published" invariant intact; the admin
  // can re-feature it (or something else) once it actually goes live.
  blog.featured = false;
  await blog.save();
  res.json(blog);
}

// Changes only the scheduled publication time of an already-scheduled
// post — status/title/slug/content/etc. are all left untouched. The
// background scheduler (utils/blogScheduler.js) just polls for
// status === "scheduled" && scheduledFor <= now, so simply moving
// scheduledFor forward or back is all that's needed for it to publish
// at the new time; no second scheduler/interval is involved.
export async function rescheduleBlog(req, res) {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(404).json({ message: "Blog post not found." });
  }
  if (blog.status !== "scheduled") {
    return res.status(400).json({ message: "Only a scheduled post can have its schedule date changed." });
  }

  // Same validation as scheduleBlog above — never trust the frontend's
  // own check. Rejects a missing value, an unparseable date, and a
  // date that isn't strictly in the future, all with HTTP 400.
  const { scheduledFor } = req.body;
  const date = new Date(scheduledFor);
  if (!scheduledFor || Number.isNaN(date.getTime()) || date <= new Date()) {
    return res.status(400).json({ message: "Please provide a valid future date/time." });
  }

  blog.scheduledFor = date;
  await blog.save();
  res.json(blog);
}

export async function unpublishBlog(req, res) {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(404).json({ message: "Blog post not found." });
  }
  assertCanModify(req.user, blog);
  blog.status = "draft";
  blog.scheduledFor = null;
  // Same reasoning as scheduleBlog above — a draft can't be the public
  // featured article.
  blog.featured = false;
  await blog.save();
  res.json(blog);
}