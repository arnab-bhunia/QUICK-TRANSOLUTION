import "./BlogPagination.css";

export default function BlogPagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="blog-pagination" aria-label="Blog pagination">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}>
        &larr; Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={p === page ? "is-active" : ""}
          onClick={() => onChange(p)}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </button>
      ))}
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next &rarr;
      </button>
    </nav>
  );
}
