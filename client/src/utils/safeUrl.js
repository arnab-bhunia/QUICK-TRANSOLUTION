// ============================================================================
// SAFE LINK PROTOCOLS (#43)
//
// Single source of truth for "is this URL safe to ever become a
// clickable/executable <a href>", used on BOTH sides of the Tiptap link
// feature:
//   - editor input side: admin/BlogEditor.jsx, when a user sets a link
//   - render side: components/blog/BlogContent.jsx, when stored Tiptap
//     JSON is turned into real anchor elements for public visitors
//
// Keeping one allowlist in one place means a protocol can't be hardened
// on one side and forgotten on the other.
// ============================================================================

// Everything else (javascript:, data:, vbscript:, file:, and anything
// with no recognized scheme at all) is rejected. Bare "//host/path" and
// relative paths ("/about", "about") are allowed through as ordinary
// same-site/relative links — they carry no protocol at all, so they
// can't execute script.
const ALLOWED_PROTOCOLS = ["http:", "https:", "mailto:"];

export function isSafeUrl(rawUrl) {
  if (typeof rawUrl !== "string") return false;

  // Strip control characters and leading/trailing whitespace — browsers
  // historically tolerate things like "java\tscript:alert(1)" as a way
  // to sneak past naive string checks, so normalize before inspecting.
  const url = rawUrl.replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (!url) return false;

  // No scheme at all ("/about", "about", "#section", "//example.com")
  // — never executable, always safe to treat as a normal link.
  if (!/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(url)) return true;

  try {
    // A base is only needed so the URL constructor can parse a
    // protocol-relative or relative string the same way a browser
    // would; the base itself is never used for anything else.
    const parsed = new URL(url, "https://example.invalid");
    return ALLOWED_PROTOCOLS.includes(parsed.protocol.toLowerCase());
  } catch {
    return false;
  }
}

// Returns the URL unchanged if safe, or null if it should be rejected —
// convenient at call sites that just want "give me a safe href or
// nothing."
export function sanitizeUrl(rawUrl) {
  return isSafeUrl(rawUrl) ? rawUrl.trim() : null;
}
