import BlogCard from "./BlogCard";
import "./BlogGrid.css";

export default function BlogGrid({ blogs, emptyMessage = "No articles found." }) {
  if (!blogs || blogs.length === 0) {
    return <p className="blog-grid-empty">{emptyMessage}</p>;
  }

  return (
    <div className="blog-grid">
      {blogs.map((blog) => (
        <BlogCard key={blog._id} blog={blog} />
      ))}
    </div>
  );
}
