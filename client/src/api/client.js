// ============================================================================
// API CLIENT
// All calls to the Express/MongoDB backend go through here.
// Set VITE_API_URL in client/.env to point at a deployed backend;
// it defaults to the local dev server on port 5000.
// ============================================================================

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Request failed");
  }

  return res.json();
}

export function subscribeNewsletter(payload) {
  return request("/newsletter", payload);
}

export function submitQuote(payload) {
  return request("/quotes", payload);
}

export function submitChatQuery(payload) {
  return request("/chat", payload);
}

export function submitUnansweredQuery(payload) {
  return request("/chat/unanswered", payload);
}