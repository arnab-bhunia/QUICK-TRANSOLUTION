const SCORE_THRESHOLD = 0.5;

// Verifies a reCAPTCHA v3 token server-side. Never throws — a Google
// outage or network hiccup fails CLOSED (returns false, request
// rejected) rather than crashing the route with an unhandled error.
export async function verifyRecaptcha(token, remoteIp) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) {
    // Not configured yet — this is expected until the frontend is wired
    // up with a site key and starts sending real tokens. Skipping here
    // rather than hard-failing every lookup in the meantime.
    // REMOVE THIS BYPASS before relying on this in production.
    console.warn("RECAPTCHA_SECRET_KEY not set — skipping reCAPTCHA verification.");
    return true;
  }

  if (!token) return false;

  try {
    const params = new URLSearchParams({
      secret,
      response: token,
      ...(remoteIp ? { remoteip: remoteIp } : {}),
    });

    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    const data = await res.json();
    return Boolean(data.success) && (data.score ?? 0) >= SCORE_THRESHOLD;
  } catch (err) {
    console.error("reCAPTCHA verification request failed:", err.message);
    return false;
  }
}
