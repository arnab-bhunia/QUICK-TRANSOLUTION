import { Link } from "react-router-dom";
import "./FeaturedBlog.css";

export default function FeaturedBlog({ blog }) {
  if (!blog) return null;

  return (
    <Link to={`/blogs/${blog.slug}`} className="featured-blog">
      <div className="featured-blog-image">
        {blog.featuredImage?.url ? (
          <img src={blog.featuredImage.url} alt={blog.featuredImage.alt || blog.title} />
        ) : (
          <div className="featured-blog-image-fallback" aria-hidden="true" />
        )}
      </div>
      <div className="featured-blog-body">
        <span className="featured-blog-eyebrow">
          {blog.category || "Featured"} &middot;{" "}
          {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
          })}
        </span>
        <h2>{blog.title}</h2>
        {blog.excerpt && <p>{blog.excerpt}</p>}
        <span className="featured-blog-cta">Read Article &rarr;</span>
      </div>
    </Link>
  );
}
