import BlogGrid from "./BlogGrid";
import "./RelatedBlogs.css";

export default function RelatedBlogs({ blogs }) {
  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="related-blogs">
      <h3>Related Articles</h3>
      <BlogGrid blogs={blogs} />
    </section>
  );
}
