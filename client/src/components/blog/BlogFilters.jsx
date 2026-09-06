import "./BlogFilters.css";

export default function BlogFilters({ categories, active, onChange }) {
  return (
    <div className="blog-filters-bar">
      <button className={`blog-filter-pill ${!active ? "is-active" : ""}`} onClick={() => onChange("")}>
        All
      </button>
      {categories.map((c) => (
        <button
          key={c}
          className={`blog-filter-pill ${active === c ? "is-active" : ""}`}
          onClick={() => onChange(c)}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
