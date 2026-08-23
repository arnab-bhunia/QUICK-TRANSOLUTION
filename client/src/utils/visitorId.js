const STORAGE_KEY = "qt_visitor_id";

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name, value) {
  const oneYear = 365 * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${oneYear}; SameSite=Lax`;
}

// Not a security token — just a stable label so we can record "this
// browser consented to X on date Y" for visitors who never create an
// account. Safe to be readable by JS; it identifies a browser, not a
// person, and carries no auth power (nothing trusts it for access).
export function getVisitorId() {
  let id = null;
  try {
    id = localStorage.getItem(STORAGE_KEY);
  } catch {
    // localStorage unavailable (private browsing edge cases, etc.)
  }
  if (!id) {
    id = readCookie(STORAGE_KEY);
  }
  if (!id) {
    id = crypto.randomUUID().replace(/-/g, "");
  }

  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // ignore — cookie fallback below still works
  }
  writeCookie(STORAGE_KEY, id);

  return id;
}
