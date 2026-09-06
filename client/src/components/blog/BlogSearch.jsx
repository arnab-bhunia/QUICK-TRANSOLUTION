import "./BlogSearch.css";

export default function BlogSearch({ value, onChange, onSubmit }) {
  return (
    <form
      className="blog-search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <input
        type="text"
        placeholder="Search articles..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button type="submit">Search</button>
    </form>
  );
}
