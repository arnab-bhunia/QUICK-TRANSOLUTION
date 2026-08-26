import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../config/redis.js";

// This is the fix for the "3x the rate limit across instances" gap
// flagged earlier: without a shared store, each server process counts
// requests independently. A distinct prefix per limiter keeps their
// counters from colliding with each other inside the same Redis DB.
// Falls back to express-rate-limit's own in-memory store (its default,
// same as before) whenever Redis isn't configured — e.g. local dev.
function makeStore(prefix) {
  if (!redisClient) return undefined;
  return new RedisStore({
    prefix: `rl:${prefix}:`,
    sendCommand: (...args) => redisClient.call(...args),
  });
}

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore("general"),
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again later." },
  store: makeStore("login"),
});

export const trackLookupLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many tracking attempts. Please try again in a few minutes." },
  store: makeStore("track"),
});

export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many accounts created from this location. Please try again later." },
  store: makeStore("signup"),
});

export const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many enquiries submitted. Please try again later." },
  store: makeStore("enquiry"),
});