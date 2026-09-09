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
    throw new Error(
      "Unable to reach the server. Please check your connection and try again."
    );
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(
      data.message || "Request failed. Please try again."
    );
    err.status = res.status;
    err.data = data;
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
    throw new Error(
      "Unable to reach the server. Please check your connection and try again."
    );
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(
      data.message || "Request failed. Please try again."
    );
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
    throw new Error(
      "Unable to reach the server. Please check your connection and try again."
    );
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(
      data.message || "Request failed. Please try again."
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return res.json();
}

// PUT REQUEST
// Used by the Blog admin CMS for updating existing blogs.


async function put(path, body) {
  let res;

  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Unable to reach the server. Please check your connection and try again."
    );
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(
      data.message || "Request failed. Please try again."
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return res.json();
}

// ============================================================================
// DELETE REQUEST
// Used by the Blog admin CMS for deleting blogs.
// ============================================================================

async function del(path) {
  let res;

  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      credentials: "include",
    });
  } catch {
    throw new Error(
      "Unable to reach the server. Please check your connection and try again."
    );
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(
      data.message || "Request failed. Please try again."
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return res.json();
}

// ============================================================================
// PUBLIC WEBSITE
// ============================================================================

export function subscribeNewsletter(payload) {
  return request("/newsletter", payload);
}

export function submitQuote(payload) {
  return request("/quotes", payload);
}

export function submitServiceEnquiry(payload) {
  return request("/service-enquiries", payload);
}

export function submitChatQuery(payload) {
  return request("/chat", payload);
}

export function submitUnansweredQuery(payload) {
  return request("/chat/unanswered", payload);
}

// Backend contract:
//   POST /api/track/lookup
//   { trackingId, phoneLast4? }
//
// -> 200
// {
//   trackingId,
//   visibility,
//   currentStatus,
//   currentLocation,
//   estimatedDelivery,
//   origin,
//   destination,
//   history: [...]
// }
//
// -> 404
// { message: "No shipment found for this tracking ID." }
//
// -> 403
// { message: "...", needsVerification: true }

export function trackShipment(payload) {
  return request("/track/lookup", payload);
}

export function clientSignup(payload) {
  return request("/client/signup", payload);
}

export function verifyClientEmailOtp(payload) {
  return request("/client/verify-email", payload);
}

export function resendClientEmailOtp(payload) {
  return request("/client/resend-otp", payload);
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

export function adminLogin(payload) {
  return request("/auth/login", payload);
}

export function adminLogout() {
  return request("/auth/logout", {});
}

export function getAdminMe() {
  return get("/auth/me");
}


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

export function listAllBookingsAdmin(page = 1) {
  return get(`/client/admin/bookings?page=${page}`);
}

export function updateBookingStatusAdmin(id, status) {
  return patch(`/client/admin/bookings/${id}/status`, { status });
}

export function listStaffAdmin() {
  return get("/auth/staff");
}

export function createStaffAdmin(payload) {
  return request("/auth/staff", payload);
}

export function listManagersAdmin() {
  return get("/auth/managers");
}

export function getAnalyticsAdmin() {
  return get("/auth/analytics");
}

export function changePasswordAdmin(payload) {
  return patch("/auth/change-password", payload);
}

export function listBlogs(params = {}) {
  const qs = new URLSearchParams(params).toString();

  return get(`/blogs${qs ? `?${qs}` : ""}`);
}

export function getBlogBySlug(slug) {
  return get(`/blogs/${slug}`);
}

export function listBlogsAdmin(params = {}) {
  const qs = new URLSearchParams(params).toString();

  return get(`/admin/blogs${qs ? `?${qs}` : ""}`);
}

export function getBlogAdmin(id) {
  return get(`/admin/blogs/${id}`);
}

export function createBlogAdmin(payload) {
  return request("/admin/blogs", payload);
}

export function updateBlogAdmin(id, payload) {
  return put(`/admin/blogs/${id}`, payload);
}

export function deleteBlogAdmin(id) {
  return del(`/admin/blogs/${id}`);
}

export function publishBlogAdmin(id) {
  return patch(`/admin/blogs/${id}/publish`, {});
}

export function scheduleBlogAdmin(id, scheduledFor) {
  return patch(`/admin/blogs/${id}/schedule`, {
    scheduledFor,
  });
}

export function rescheduleBlogAdmin(id, scheduledFor) {
  return patch(`/admin/blogs/${id}/reschedule`, {
    scheduledFor,
  });
}

export function unpublishBlogAdmin(id) {
  return patch(`/admin/blogs/${id}/draft`, {});
}

// Blog image/PDF uploads use multipart/form-data.

// IMPORTANT:
// Do NOT manually set the Content-Type header here.
// The browser automatically creates the correct multipart boundary.
//
// The browser only communicates with our own backend.
// Cloudinary credentials remain server-side.

async function uploadFile(path, file) {
  const formData = new FormData();

  formData.append("file", file);

  let res;

  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
  } catch {
    throw new Error(
      "Unable to reach the server. Please check your connection and try again."
    );
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));

    const err = new Error(
      data.message || "Upload failed. Please try again."
    );

    err.status = res.status;
    err.data = data;

    throw err;
  }

  return res.json();
}

export function uploadBlogImage(file) {
  return uploadFile("/admin/uploads/image", file);
}

export function uploadBlogPdf(file) {
  return uploadFile("/admin/uploads/pdf", file);
}

export function listServiceEnquiriesAdmin(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return get(`/service-enquiries${qs ? `?${qs}` : ""}`);
}

export function getServiceEnquiryCountsAdmin() {
  return get("/service-enquiries/counts");
}

export function getServiceEnquiryAdmin(id) {
  return get(`/service-enquiries/${id}`);
}

export function getServiceEnquiryHistoryAdmin(id) {
  return get(`/service-enquiries/${id}/history`);
}

export function updateServiceEnquiryStatusAdmin(id, status) {
  return patch(`/service-enquiries/${id}/status`, { status });
}

export function sendServiceEnquiryEmailAdmin(id, payload) {
  return request(`/service-enquiries/${id}/email`, payload);
}

export function getActiveServiceEnquiryEmailOperationAdmin(id) {
  return get(`/service-enquiries/${id}/email/active`);
}

export function resolveServiceEnquiryEmailOperationAdmin(id, emailId, payload) {
  return request(`/service-enquiries/${id}/email/${emailId}/resolve`, payload);
}