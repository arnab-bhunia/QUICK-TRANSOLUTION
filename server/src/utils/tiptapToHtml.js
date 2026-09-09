// ============================================================================
// TIPTAP JSON -> SAFE EMAIL HTML/TEXT
//
// Mirrors the approach client/src/components/blog/BlogContent.jsx already
// uses for blog posts: never trust or forward raw HTML, only ever walk a
// Tiptap JSON document through an explicit allowlist of node/mark types
// and build the output ourselves. Text is always escaped; links go
// through the same protocol allowlist as client/src/utils/safeUrl.js.
//
// This is the ONLY place the Send Email composer's content turns into
// the HTML actually emailed to a customer — the client sends structured
// JSON (editor.getJSON()), never a pre-built HTML string, so a
// compromised/malicious client can at worst submit unrecognized JSON
// (which this renders as nothing) rather than arbitrary markup/script.
// ============================================================================

const ALLOWED_LINK_PROTOCOLS = ["http:", "https:", "mailto:"];

function safeHref(rawUrl) {
  if (typeof rawUrl !== "string") return null;
  const url = rawUrl.replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (!url) return null;
  if (!/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(url)) return escapeHtml(url); // relative/no-scheme
  try {
    const parsed = new URL(url);
    return ALLOWED_LINK_PROTOCOLS.includes(parsed.protocol.toLowerCase())
      ? escapeHtml(url)
      : null;
  } catch {
    return null;
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderMarksHtml(text, marks = []) {
  return marks.reduce((acc, mark) => {
    switch (mark.type) {
      case "bold":
        return `<strong>${acc}</strong>`;
      case "italic":
        return `<em>${acc}</em>`;
      case "underline":
        return `<u>${acc}</u>`;
      case "link": {
        const href = safeHref(mark.attrs?.href);
        return href ? `<a href="${href}">${acc}</a>` : acc;
      }
      default:
        return acc;
    }
  }, escapeHtml(text));
}

function renderNodeHtml(node) {
  if (!node || typeof node !== "object") return "";

  const children = () => (Array.isArray(node.content) ? node.content.map(renderNodeHtml).join("") : "");

  switch (node.type) {
    case "doc":
      return children();
    case "paragraph":
      return `<p>${children() || "&nbsp;"}</p>`;
    case "heading": {
      const level = Math.min(Math.max(Number(node.attrs?.level) || 2, 1), 3);
      return `<h${level}>${children()}</h${level}>`;
    }
    case "text":
      return renderMarksHtml(node.text || "", node.marks);
    case "bulletList":
      return `<ul>${children()}</ul>`;
    case "orderedList":
      return `<ol>${children()}</ol>`;
    case "listItem":
      return `<li>${children()}</li>`;
    case "blockquote":
      return `<blockquote>${children()}</blockquote>`;
    case "hardBreak":
      return "<br/>";
    default:
      // Unknown/unsupported node type (e.g. a table or image, which the
      // email composer's toolbar never offers) — render its text
      // content only, never drop straight to raw markup.
      return children();
  }
}

function renderNodeText(node) {
  if (!node || typeof node !== "object") return "";
  const children = () => (Array.isArray(node.content) ? node.content.map(renderNodeText).join("") : "");

  switch (node.type) {
    case "text":
      return node.text || "";
    case "paragraph":
    case "heading":
    case "blockquote":
      return `${children()}\n`;
    case "listItem":
      return `- ${children()}\n`;
    case "hardBreak":
      return "\n";
    default:
      return children();
  }
}

const MAX_NODES = 4000; // guards against a pathologically large/deep document

function countNodes(node, seen = { n: 0 }) {
  if (!node || typeof node !== "object") return seen.n;
  seen.n += 1;
  if (seen.n > MAX_NODES) return seen.n;
  if (Array.isArray(node.content)) {
    for (const child of node.content) countNodes(child, seen);
  }
  return seen.n;
}

// Returns { html, text } or throws if `doc` isn't a plausible Tiptap
// document (defense in depth — the route also validates shape before
// calling this).
export function renderTiptapEmail(doc) {
  if (!doc || typeof doc !== "object" || doc.type !== "doc") {
    throw new Error("Invalid email content.");
  }
  if (countNodes(doc) > MAX_NODES) {
    throw new Error("Email content is too long.");
  }

  const html = renderNodeHtml(doc);
  const text = renderNodeText(doc).trim();
  if (!text) {
    throw new Error("Email message cannot be empty.");
  }
  return { html, text };
}
