import Redis from "ioredis";

let client = null;

if (process.env.REDIS_URL) {
  client = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 2,
  });

  client.on("error", (err) => {
    // Never crash the process over a cache/rate-limit backend issue —
    // just log it. Every helper below fails open (treats it as a miss)
    // when Redis is unreachable, so the app keeps serving requests.
    console.error("Redis error:", err.message);
  });

  client.on("connect", () => {
    console.log("Redis connected");
  });
} else {
  console.warn(
    "REDIS_URL not set — running without Redis (in-memory rate limiting, no auth caching). " +
      "Fine for local dev; set REDIS_URL in production once you have real traffic."
  );
}

export default client;

// --- Small cache helpers used by requireAuth / requireClientAuth ---
// Every function here is safe to call even when client is null.

export async function cacheGet(key) {
  if (!client) return null;
  try {
    const raw = await client.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Redis GET failed:", err.message);
    return null; // fail open — caller treats this as a cache miss
  }
}

export async function cacheSet(key, value, ttlSeconds) {
  if (!client) return;
  try {
    await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    console.error("Redis SET failed:", err.message);
  }
}

export async function cacheDel(key) {
  if (!client) return;
  try {
    await client.del(key);
  } catch (err) {
    console.error("Redis DEL failed:", err.message);
  }
}