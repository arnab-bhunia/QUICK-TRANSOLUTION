import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, Navigate } from "react-router-dom";
import { getBlogBySlug } from "../api/client";
import BlogContent from "../components/blog/BlogContent";
import PdfBlog from "../components/blog/PdfBlog";
import RelatedBlogs from "../components/blog/RelatedBlogs";
import { useSeo } from "../hooks/useSeo";
import "./BlogDetails.css";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Rough estimate, same principle every blog platform uses — word count
// divided by an average adult silent-reading speed (~200 wpm). Only
// meaningful for written articles; PDF publications don't have
// extractable text here, so it's skipped for those.
function estimateReadTime(content) {
  const text = JSON.stringify(content || "");
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default function BlogDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: "loading", blog: null, related: [] });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", blog: null, related: [] });

    getBlogBySlug(slug)
      .then((res) => {
        if (cancelled) return;

        // The API found this post via an OLD slug (see
        // controllers/blogController.js getPublicBlogBySlug) — move the
        // browser to the real current URL instead of rendering under
        // the stale one. `replace: true` means this doesn't add an
        // extra "back button" step. This can't loop: once the URL
        // param becomes the canonical slug, the next fetch matches it
        // directly and canonicalSlug === slug, so this branch is
        // simply never taken on the second run.
        const canonicalSlug = res.canonicalSlug || res.blog.slug;
        if (canonicalSlug !== slug) {
          navigate(`/blogs/${canonicalSlug}`, { replace: true });
          return;
        }

        setState({ status: "ready", blog: res.blog, related: res.related });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 404) {
          setState({ status: "not-found", blog: null, related: [] });
        } else {
          setState({ status: "error", blog: null, related: [] });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug, navigate]);

  const { blog } = state;

  // A custom canonicalUrl set by an admin always wins. Otherwise, the
  // canonical URL is simply this page's own current, real URL — using
  // the CURRENT slug specifically (not whatever slug happened to be in
  // the address bar a moment ago), so an old-slug visit that hasn't
  // finished redirecting yet never announces the wrong URL as canonical.
  const canonicalUrl = blog
    ? blog.seo?.canonicalUrl || `${window.location.origin}/blogs/${blog.slug}`
    : undefined;

  useSeo({
    title: blog ? blog.seo?.metaTitle || `${blog.title} | Quick Transolution` : undefined,
    description: blog ? blog.seo?.metaDescription || blog.excerpt : undefined,
    image: blog ? blog.seo?.ogImage || blog.featuredImage?.url : undefined,
    canonicalUrl,
  });

  if (state.status === "not-found") {
    return <Navigate to="/blogs" replace />;
  }

  if (state.status === "loading") {
    return (
      <section className="section blog-details-page">
        <div className="container">
          <p className="blogs-status">Loading article...</p>
        </div>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="section blog-details-page">
        <div className="container">
          <p className="blogs-status blogs-status-error">
            Could not load this article right now. Please try again shortly.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="blog-details-page">
      <div
        className="blog-details-banner"
        style={blog.featuredImage?.url ? { backgroundImage: `url(${blog.featuredImage.url})` } : undefined}
      >
        <div className="blog-details-banner-scrim" />
        <div className="container">
          <span className="blog-details-eyebrow">{blog.category || "Article"}</span>
          <h1>{blog.title}</h1>
          <p className="blog-details-meta">
            {formatDate(blog.publishedAt || blog.createdAt)}
            {blog.contentType === "article" && ` \u00b7 ${estimateReadTime(blog.content)} min read`}
          </p>
        </div>
      </div>

      <div className="container blog-details-body">
        {blog.contentType === "pdf" ? <PdfBlog pdf={blog.pdf} /> : <BlogContent content={blog.content} />}

        {blog.tags?.length > 0 && (
          <div className="blog-details-tags">
            {blog.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        )}

        <div className="blog-details-back">
          <Link to="/blogs">&larr; Back to all articles</Link>
        </div>

        <RelatedBlogs blogs={state.related} />
      </div>
    </div>
  );
}
