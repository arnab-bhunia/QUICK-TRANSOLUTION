import mongoose from "mongoose";
import { promoteDueScheduledPosts } from "./blogPublication.js";

// Reasonable per the requirement's own 30-60s range: frequent enough
// that a scheduled post goes live within a minute of its time, without
// hammering MongoDB with a query every few seconds.
const INTERVAL_MS = 60 * 1000;

let intervalHandle = null;

async function tick() {
  // Mongoose buffers queries and waits (by default, up to ~10s) for a
  // connection before giving up — same situation middleware/dbReady.js
  // guards against for incoming HTTP requests. Right at process start,
  // app.listen() and connectDB() in index.js run concurrently, so the
  // very first tick can easily land before Mongo is connected. Skipping
  // cleanly here (rather than blocking on the buffer timeout) is fine:
  // startBlogScheduler() below also re-runs this the moment the
  // connection actually comes up.
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  try {
    await promoteDueScheduledPosts();
  } catch (err) {
    // Requirement: one failed run must never crash the server or stop
    // future runs — log it and let the next interval tick proceed.
    console.error("[blog-scheduler] Failed to promote scheduled posts:", err.message);
  }
}

// Starts the background scheduler. Safe to call more than once — only
// the first call actually starts anything, so an accidental double
// import/call (e.g. during a dev hot-reload) can't spin up a second
// interval running the promotion query twice as often.
export function startBlogScheduler() {
  if (intervalHandle) return;

  // Restart recovery: catches up on anything that became due while the
  // server was offline, as soon as the database is actually reachable —
  // either right now (already connected) or the moment the pending
  // connectDB() call in index.js finishes.
  if (mongoose.connection.readyState === 1) {
    tick();
  } else {
    mongoose.connection.once("connected", tick);
  }

  // Then keep checking periodically for as long as the process runs.
  intervalHandle = setInterval(tick, INTERVAL_MS);
  // Don't let this timer alone keep the Node process alive (relevant
  // for scripts/tests that import the app and expect a clean exit).
  intervalHandle.unref?.();
}

// Exposed only so a future test runner (or a graceful-shutdown hook, if
// one is ever added) can stop the interval. Not called anywhere today —
// the process exiting cleans it up either way.
export function stopBlogScheduler() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}
