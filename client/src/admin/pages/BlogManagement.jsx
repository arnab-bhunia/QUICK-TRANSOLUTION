import { Fragment, useEffect, useState } from "react";
import {
  listBlogsAdmin,
  getBlogAdmin,
  createBlogAdmin,
  updateBlogAdmin,
  deleteBlogAdmin,
  publishBlogAdmin,
  scheduleBlogAdmin,
  rescheduleBlogAdmin,
  unpublishBlogAdmin,
} from "../../api/client";
import { useAlert } from "../../context/AlertContext";
import { useAdminAuth } from "../context/AdminAuthContext";
import ImageUploader from "../components/ImageUploader";
import PdfUploader from "../components/PdfUploader";
import SeoFields from "../components/SeoFields";
import BlogEditor from "../components/BlogEditor";
import RescheduleModal from "../components/RescheduleModal";
import "./StaffPanel.css";
import "./BlogManagement.css";

const emptyForm = {
  title: "",
  contentType: "article",
  excerpt: "",
  featuredImage: null,
  content: null,
  pdf: null,
  category: "",
  tagsInput: "",
  authorName: "",
  seo: { metaTitle: "", metaDescription: "", ogImage: "", ogImageKey: null, canonicalUrl: "" },
};

const STATUS_LABELS = { draft: "Draft", scheduled: "Scheduled", published: "Published" };

export default function BlogManagement() {
  const { staff: me } = useAdminAuth();
  const alert = useAlert();

  const [view, setView] = useState("list"); // "list" | "form"
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [blogs, setBlogs] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [schedulingId, setSchedulingId] = useState(null);
  const [scheduleDate, setScheduleDate] = useState("");

  // "Change Schedule Date" modal state — separate from the inline
  // schedulingId/scheduleDate row above, which is the existing
  // draft -> scheduled flow and is left untouched.
  const [reschedulingBlog, setReschedulingBlog] = useState(null);
  const [reschedulingSaving, setReschedulingSaving] = useState(false);
  const [reschedulingError, setReschedulingError] = useState("");

  // #24 — pagination state. `page`/`totalPages` mirror exactly what the
  // existing backend pagination already returns (see listAdminBlogs in
  // blogController.js); this UI never fetches more than one page's
  // worth of blogs at a time.
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // targetPage defaults to the current page (e.g. a plain re-load after
  // create/edit/delete/publish); callers that change search/status
  // filters explicitly pass 1 so pagination resets, per #24.
  const load = (targetPage = page) => {
    setLoaded(false);
    const params = { page: targetPage };
    if (statusFilter) params.status = statusFilter;
    if (search.trim()) params.search = search.trim();
    listBlogsAdmin(params)
      .then((res) => {
        setBlogs(res.items);
        setPage(res.page || targetPage);
        setTotalPages(res.totalPages || 1);
      })
      .catch((err) => alert.error(err.message || "Could not load blog posts."))
      .finally(() => setLoaded(true));
  };

  // Status filter changing is the one case that needs its own effect —
  // every other trigger (search, prev/next, post-save refresh) calls
  // load() directly. Also covers the initial mount load.
  useEffect(() => load(1), [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const runSearch = () => load(1); // #24: any new search resets to page 1
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    load(p);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setView("form");
  };

  const openEdit = async (id) => {
    try {
      const blog = await getBlogAdmin(id);
      setEditingId(id);
      setForm({
        title: blog.title,
        contentType: blog.contentType,
        excerpt: blog.excerpt || "",
        featuredImage: blog.featuredImage || null,
        content: blog.content || null,
        pdf: blog.pdf || null,
        category: blog.category || "",
        tagsInput: (blog.tags || []).join(", "),
        authorName: blog.author?.name || "",
        seo: blog.seo || emptyForm.seo,
      });
      setView("form");
    } catch (err) {
      alert.error(err.message || "Could not load this post.");
    }
  };

  const backToList = () => {
    setView("list");
    load();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert.error("Title is required.");
      return;
    }
    if (form.contentType === "pdf" && !form.pdf?.url) {
      alert.error("Please upload a PDF file.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      contentType: form.contentType,
      excerpt: form.excerpt,
      featuredImage: form.featuredImage,
      content: form.contentType === "article" ? form.content : null,
      pdf: form.contentType === "pdf" ? form.pdf : null,
      category: form.category,
      tags: form.tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      authorName: form.authorName,
      seo: form.seo,
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateBlogAdmin(editingId, payload);
        alert.success("Post updated.");
      } else {
        await createBlogAdmin(payload);
        alert.success("Draft created.");
      }
      backToList();
    } catch (err) {
      alert.error(err.message || "Could not save this post.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (blog) => {
    if (!window.confirm(`Delete "${blog.title}"? This can't be undone.`)) return;
    try {
      await deleteBlogAdmin(blog._id);
      alert.success("Post deleted.");
      load();
    } catch (err) {
      alert.error(err.message || "Could not delete this post.");
    }
  };

  const handlePublish = async (id) => {
    try {
      await publishBlogAdmin(id);
      alert.success("Post published.");
      load();
    } catch (err) {
      alert.error(err.message || "Could not publish this post.");
    }
  };

  const handleUnpublish = async (id) => {
    try {
      await unpublishBlogAdmin(id);
      alert.success("Moved back to draft.");
      load();
    } catch (err) {
      alert.error(err.message || "Could not update this post.");
    }
  };

  // #48 — admin-only single-featured-post toggle. The server (see
  // updateBlog in blogController.js) is the actual enforcement point:
  // it rejects featuring anything that isn't published, and clears
  // `featured` from every other post once this one is confirmed
  // featured. This just calls the existing update endpoint with the
  // one field that changed — no second feature system.
  const handleToggleFeatured = async (blog) => {
    try {
      await updateBlogAdmin(blog._id, { featured: !blog.featured });
      alert.success(blog.featured ? "Removed as featured." : "Marked as featured.");
      load();
    } catch (err) {
      alert.error(err.message || "Could not update featured status.");
    }
  };

  const confirmSchedule = async (id) => {
    if (!scheduleDate) {
      alert.error("Please pick a date and time.");
      return;
    }
    try {
      await scheduleBlogAdmin(id, new Date(scheduleDate).toISOString());
      alert.success("Post scheduled.");
      setSchedulingId(null);
      setScheduleDate("");
      load();
    } catch (err) {
      alert.error(err.message || "Could not schedule this post.");
    }
  };

  const openReschedule = (blog) => {
    setReschedulingError("");
    setReschedulingBlog(blog);
  };

  const closeReschedule = () => {
    if (reschedulingSaving) return; // no closing mid-request
    setReschedulingBlog(null);
    setReschedulingError("");
  };

  const handleReschedule = async (isoDate) => {
    setReschedulingSaving(true);
    setReschedulingError("");
    try {
      const updated = await rescheduleBlogAdmin(reschedulingBlog._id, isoDate);
      // Update just this row in place — keeps the current page, search,
      // and status filter exactly as they are (#24 pagination state),
      // rather than re-running load() and risking a jump.
      setBlogs((prev) =>
        prev.map((b) => (b._id === updated._id ? { ...b, scheduledFor: updated.scheduledFor } : b))
      );
      alert.success("Schedule date updated.");
      setReschedulingBlog(null);
    } catch (err) {
      // Keep the modal open and show the backend's error — never pretend
      // the date changed when it didn't.
      setReschedulingError(err.message || "Could not update the schedule date.");
    } finally {
      setReschedulingSaving(false);
    }
  };

  const isAdmin = me?.role === "admin";

  // ---------------------------------------------------------------------
  // FORM VIEW (create / edit)
  // ---------------------------------------------------------------------
  if (view === "form") {
    return (
      <div className="staff-panel">
        <div className="admin-panel-head">
          <h2>{editingId ? "Edit Post" : "Create Post"}</h2>
          <button className="admin-btn" onClick={backToList}>
            &larr; Back to all posts
          </button>
        </div>

        <form className="admin-card staff-create-form" onSubmit={submit}>
          <div className="staff-create-grid">
            <label className="admin-field" style={{ gridColumn: "1 / -1" }}>
              <span>Title</span>
              <input
                required
                maxLength={160}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </label>

            <label className="admin-field">
              <span>Content type</span>
              <select
                value={form.contentType}
                disabled={!!editingId} // switching type on an existing post would orphan its content — start a new post instead
                onChange={(e) => setForm((f) => ({ ...f, contentType: e.target.value }))}
              >
                <option value="article">Written Article</option>
                <option value="pdf">PDF Publication</option>
              </select>
            </label>

            <label className="admin-field">
              <span>Category</span>
              <input
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="e.g. Technology"
              />
            </label>

            <label className="admin-field" style={{ gridColumn: "1 / -1" }}>
              <span>Excerpt ({form.excerpt.length}/300)</span>
              <textarea
                rows={2}
                maxLength={300}
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              />
            </label>

            <label className="admin-field">
              <span>Tags (comma separated)</span>
              <input
                value={form.tagsInput}
                onChange={(e) => setForm((f) => ({ ...f, tagsInput: e.target.value }))}
                placeholder="GPS Tracking, Fleet Management"
              />
            </label>

            <label className="admin-field">
              <span>Author name</span>
              <input
                value={form.authorName}
                onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
                placeholder={me?.name}
              />
            </label>
          </div>

          <ImageUploader
            label="Featured image"
            value={form.featuredImage}
            onChange={(v) => setForm((f) => ({ ...f, featuredImage: v }))}
          />

          {form.contentType === "article" ? (
            <div className="admin-field">
              <span>Content</span>
              <BlogEditor
                content={form.content}
                onChange={(json) => setForm((f) => ({ ...f, content: json }))}
              />
            </div>
          ) : (
            <PdfUploader value={form.pdf} onChange={(v) => setForm((f) => ({ ...f, pdf: v }))} />
          )}

          <div className="admin-field">
            <span>SEO</span>
            <SeoFields
              value={form.seo}
              defaultTitle={form.title}
              onChange={(v) => setForm((f) => ({ ...f, seo: v }))}
            />
          </div>

          <button className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Save Changes" : "Save Draft"}
          </button>
        </form>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // LIST VIEW
  // ---------------------------------------------------------------------
  return (
    <div className="staff-panel">
      <div className="admin-panel-head">
        {/* #51: Admin sees every blog under the general heading; a
            Content Writer only ever sees (and can only ever fetch —
            the backend ownership filter in listAdminBlogs is the real
            boundary, this heading is just making that visible) their
            own posts, so the UI says so plainly. */}
        <h2>{isAdmin ? "Blog Management" : "My Blogs"}</h2>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>
          + Create Blog
        </button>
      </div>

      <div className="admin-card blog-filters">
        <input
          placeholder="Search title, excerpt, tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)} // #24: page reset happens in the useEffect above
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
        </select>
        <button className="admin-btn" onClick={runSearch}>
          Search
        </button>
      </div>

      <div className="admin-card">
        {!loaded && <p className="admin-empty">Loading...</p>}
        {loaded && blogs.length === 0 && <p className="admin-empty">No blog posts yet.</p>}
        {blogs.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Status</th>
                  {isAdmin && <th>Featured</th>}
                  <th>By</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((b) => (
                  <Fragment key={b._id}>
                    <tr>
                      <td>{b.title}</td>
                      <td>{b.contentType === "pdf" ? "PDF" : "Article"}</td>
                      <td>{b.category || "—"}</td>
                      <td>
                        <span
                          className={`admin-badge ${
                            b.status === "published"
                              ? "admin-badge-converted"
                              : b.status === "scheduled"
                              ? "admin-badge-on_hold"
                              : "admin-badge-contacted"
                          }`}
                        >
                          {STATUS_LABELS[b.status]}
                        </span>
                      </td>
                      {isAdmin && (
                        <td>
                          {/* #48: only a published post is eligible — the
                              same rule the server enforces in updateBlog. */}
                          {b.status === "published" ? (
                            <button
                              className={`admin-btn ${b.featured ? "admin-btn-primary" : ""}`}
                              onClick={() => handleToggleFeatured(b)}
                              title={
                                b.featured
                                  ? "Remove as the site's featured article"
                                  : "Make this the site's one featured article"
                              }
                            >
                              {b.featured ? "★ Featured" : "☆ Set Featured"}
                            </button>
                          ) : (
                            "—"
                          )}
                        </td>
                      )}
                      <td>{b.createdBy?.name || "—"}</td>
                      <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                      <td className="blog-actions">
                        <button className="admin-btn" onClick={() => openEdit(b._id)}>
                          Edit
                        </button>
                        {isAdmin && b.status !== "published" && (
                          <button className="admin-btn" onClick={() => handlePublish(b._id)}>
                            Publish
                          </button>
                        )}
                        {isAdmin && b.status === "draft" && (
                          <button
                            className="admin-btn"
                            onClick={() => setSchedulingId(schedulingId === b._id ? null : b._id)}
                          >
                            Schedule
                          </button>
                        )}
                        {isAdmin && b.status === "scheduled" && (
                          <button className="admin-btn" onClick={() => openReschedule(b)}>
                            Change Schedule Date
                          </button>
                        )}
                        {b.status !== "draft" && (
                          <button className="admin-btn" onClick={() => handleUnpublish(b._id)}>
                            Move to Draft
                          </button>
                        )}
                        {(isAdmin || b.status === "draft") && (
                          <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(b)}>
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                    {schedulingId === b._id && (
                      <tr>
                        <td colSpan={isAdmin ? 8 : 7} className="blog-schedule-row">
                          <input
                            type="datetime-local"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                          />
                          <button className="admin-btn admin-btn-primary" onClick={() => confirmSchedule(b._id)}>
                            Confirm schedule
                          </button>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* #24: Previous/Next + "page X of Y", driven entirely by the
            existing backend pagination response — never fetches every
            blog just to paginate client-side. */}
        {loaded && totalPages > 1 && (
          <div className="blog-pagination-bar">
            <button className="admin-btn" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
              &larr; Previous
            </button>
            <span className="blog-pagination-status">
              Page {page} of {totalPages}
            </span>
            <button className="admin-btn" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
              Next &rarr;
            </button>
          </div>
        )}
      </div>

      <RescheduleModal
        blog={reschedulingBlog}
        saving={reschedulingSaving}
        apiError={reschedulingError}
        onCancel={closeReschedule}
        onSave={handleReschedule}
      />
    </div>
  );
}
