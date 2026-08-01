// ============================================================================
// API CLIENT
// All calls to the Express/MongoDB backend go through here.
// Set VITE_API_URL in client/.env to point at a deployed backend;
// it defaults to the local dev server on port 5000.
// ============================================================================

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, body) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // fetch() itself threw — the request never reached the server at all
    // (server down, wrong VITE_API_URL, CORS blocked, offline, etc).
    // The browser's own message here ("Failed to fetch") is developer
    // jargon, so swap it for something a visitor can actually understand.
    throw new Error("Unable to reach the server. Please check your connection and try again.");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.message || "Request failed. Please try again.");
    err.status = res.status;
    err.data = data; // lets callers read structured fields, e.g. data.needsVerification
    throw err;
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

// Public shipment lookup. Backend contract (to be built next):
//   POST /api/track/lookup   { trackingId, phoneLast4? }
//   -> 200 { trackingId, visibility, currentStatus, currentLocation,
//            estimatedDelivery, origin, destination, history: [...] }
//   -> 404 { message: "No shipment found for this tracking ID." }
//   -> 403 { message: "...", needsVerification: true }  when a private
//      shipment is looked up without (or with a wrong) phoneLast4
export function trackShipment(payload) {
  return request("/track/lookup", payload);
}