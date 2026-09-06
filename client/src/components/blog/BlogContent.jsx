import { sanitizeUrl } from "../../utils/safeUrl";
import "./BlogContent.css";

// Renders Tiptap's structured JSON content (stored in MongoDB as-is,
// see models/Blog.js) into our own styled React elements — the site
// controls every bit of the final appearance, Tiptap only ever
// supplied the structured content, never any HTML/CSS of its own.

function renderMarks(text, marks = []) {
  return marks.reduce((acc, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong>{acc}</strong>;
      case "italic":
        return <em>{acc}</em>;
      case "underline":
        return <u>{acc}</u>;
      case "link": {
        // #43: this content came straight out of MongoDB — it could
        // predate the editor-side hardening above, or (defense in
        // depth) have been written directly via the API. Never trust
        // it as executable just because it was stored as a "link"
        // mark. An unsafe protocol (javascript:, data:, vbscript:, ...)
        // renders as plain text instead of a clickable link, rather
        // than silently dropping the reader's content.
        const safeHref = sanitizeUrl(mark.attrs?.href);
        if (!safeHref) return acc;
        return (
          <a href={safeHref} target="_blank" rel="noopener noreferrer">
            {acc}
          </a>
        );
      }
      default:
        return acc;
    }
  }, text);
}

function renderNode(node, key) {
  if (!node) return null;

  switch (node.type) {
    case "doc":
      return <div key={key}>{node.content?.map((child, i) => renderNode(child, i))}</div>;

    case "paragraph":
      return <p key={key}>{node.content?.map((child, i) => renderNode(child, i)) || <br />}</p>;

    case "heading": {
      const level = node.attrs?.level || 2;
      const Tag = `h${Math.min(Math.max(level, 1), 6)}`;
      return <Tag key={key}>{node.content?.map((child, i) => renderNode(child, i))}</Tag>;
    }

    case "text":
      return <span key={key}>{renderMarks(node.text, node.marks)}</span>;

    case "bulletList":
      return <ul key={key}>{node.content?.map((child, i) => renderNode(child, i))}</ul>;

    case "orderedList":
      return <ol key={key}>{node.content?.map((child, i) => renderNode(child, i))}</ol>;

    case "listItem":
      return <li key={key}>{node.content?.map((child, i) => renderNode(child, i))}</li>;

    case "blockquote":
      return <blockquote key={key}>{node.content?.map((child, i) => renderNode(child, i))}</blockquote>;

    case "image":
      return (
        <img
          key={key}
          src={node.attrs?.src}
          alt={node.attrs?.alt || ""}
          loading="lazy"
        />
      );

    case "horizontalRule":
      return <hr key={key} />;

    case "hardBreak":
      return <br key={key} />;

    case "table":
      return (
        <div className="blog-content-table-wrap" key={key}>
          <table>
            <tbody>{node.content?.map((child, i) => renderNode(child, i))}</tbody>
          </table>
        </div>
      );

    case "tableRow":
      return <tr key={key}>{node.content?.map((child, i) => renderNode(child, i))}</tr>;

    case "tableHeader":
      return <th key={key}>{node.content?.map((child, i) => renderNode(child, i))}</th>;

    case "tableCell":
      return <td key={key}>{node.content?.map((child, i) => renderNode(child, i))}</td>;

    default:
      // Unknown/future node type — render children if any exist rather
      // than silently dropping content, so an unsupported block doesn't
      // just vanish from a published article.
      return node.content ? (
        <div key={key}>{node.content.map((child, i) => renderNode(child, i))}</div>
      ) : null;
  }
}

export default function BlogContent({ content }) {
  if (!content) return null;
  return <div className="blog-content">{renderNode(content, "root")}</div>;
}
