import { Link } from "react-router-dom";
import "./BlogCard.css";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BlogCard({ blog }) {
  return (
    <Link to={`/blogs/${blog.slug}`} className="blog-card">
      <div className="blog-card-image-wrap">
        {blog.featuredImage?.url ? (
          <img src={blog.featuredImage.url} alt={blog.featuredImage.alt || blog.title} loading="lazy" />
        ) : (
          <div className="blog-card-image-fallback" aria-hidden="true" />
        )}
        {blog.contentType === "pdf" && <span className="blog-card-pdf-badge">PDF</span>}
      </div>
      <div className="blog-card-body">
        <span className="blog-card-meta">
          {blog.category || "General"} &middot; {formatDate(blog.publishedAt || blog.createdAt)}
        </span>
        <h3>{blog.title}</h3>
        {blog.excerpt && <p>{blog.excerpt}</p>}
        <span className="blog-card-cta">
          Read {blog.contentType === "pdf" ? "Publication" : "Article"} &rarr;
        </span>
      </div>
    </Link>
  );
}
