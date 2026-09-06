import { useEffect, useState } from "react";
import { listBlogs } from "../api/client";
import BlogGrid from "../components/blog/BlogGrid";
import FeaturedBlog from "../components/blog/FeaturedBlog";
import BlogFilters from "../components/blog/BlogFilters";
import BlogSearch from "../components/blog/BlogSearch";
import BlogPagination from "../components/blog/BlogPagination";
import { useSeo } from "../hooks/useSeo";
import "./Blogs.css";

const KNOWN_CATEGORIES = [
  "Logistics",
  "Technology",
  "Transportation",
  "Warehousing",
  "Sustainability",
  "Company News",
];

export default function Blogs() {
  useSeo({
    title: "Insights & Stories | Quick Transolution",
    description: "Moving ideas. Moving businesses. Logistics insights, industry reports, and company news from Quick Transolution.",
  });

  const [items, setItems] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = { page };
    if (category) params.category = category;
    if (search) params.search = search;

    listBlogs(params)
      .then((res) => {
        setItems(res.items);
        setFeatured(res.featured);
        setTotalPages(res.totalPages);
      })
      .catch((err) => setError(err.message || "Could not load articles right now."))
      .finally(() => setLoading(false));
  }, [page, category, search]);

  return (
    <section className="section blogs-page">
      <div className="container">
        <div className="blogs-hero">
          <span className="eyebrow">Insights &amp; Stories</span>
          <h1>Moving ideas. Moving businesses.</h1>
        </div>

        {page === 1 && !category && !search && <FeaturedBlog blog={featured} />}

        <BlogSearch
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={() => {
            setPage(1);
            setSearch(searchInput);
          }}
        />
        <BlogFilters
          categories={KNOWN_CATEGORIES}
          active={category}
          onChange={(c) => {
            setPage(1);
            setCategory(c);
          }}
        />

        {loading && <p className="blogs-status">Loading articles...</p>}
        {!loading && error && <p className="blogs-status blogs-status-error">{error}</p>}
        {!loading && !error && (
          <>
            <BlogGrid blogs={items} emptyMessage="No articles match your search yet." />
            <BlogPagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>
    </section>
  );
}
