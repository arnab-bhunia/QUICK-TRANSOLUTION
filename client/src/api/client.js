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
      credentials: "include", // sends/receives the httpOnly session cookie
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

async function get(path) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      credentials: "include",
    });
  } catch {
    throw new Error("Unable to reach the server. Please check your connection and try again.");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.message || "Request failed. Please try again.");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return res.json();
}

async function patch(path, body) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Unable to reach the server. Please check your connection and try again.");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.message || "Request failed. Please try again.");
    err.status = res.status;
    err.data = data;
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

// --- Client (customer) account + bookings ---
export function clientSignup(payload) {
  return request("/client/signup", payload);
}

export function clientLogin(payload) {
  return request("/client/login", payload);
}

export function clientLogout() {
  return request("/client/logout", {});
}

export function getClientMe() {
  return get("/client/me");
}

export function createBooking(payload) {
  return request("/client/bookings", payload);
}

export function listMyBookings() {
  return get("/client/bookings");
}

// --- Staff (admin) auth ---
export function adminLogin(payload) {
  return request("/auth/login", payload);
}

export function adminLogout() {
  return request("/auth/logout", {});
}

export function getAdminMe() {
  return get("/auth/me");
}

// --- Staff shipment management ---
export function listShipmentsAdmin(page = 1) {
  return get(`/track/admin?page=${page}`);
}

export function createShipmentAdmin(payload) {
  return request("/track", payload);
}

export function updateShipmentStatusAdmin(trackingId, payload) {
  return patch(`/track/${trackingId}/status`, payload);
}

export function updateShipmentVisibilityAdmin(trackingId, payload) {
  return patch(`/track/${trackingId}/visibility`, payload);
}

export function getShipmentAuditAdmin(trackingId) {
  return get(`/track/${trackingId}/audit`);
}

// --- Staff booking-request review ---
export function listAllBookingsAdmin(page = 1) {
  return get(`/client/admin/bookings?page=${page}`);
}

export function updateBookingStatusAdmin(id, status) {
  return patch(`/client/admin/bookings/${id}/status`, { status });
}