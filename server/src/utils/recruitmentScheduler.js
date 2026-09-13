import mongoose from "mongoose";
import { closeExpiredJobs } from "./recruitmentPublication.js";

// ============================================================================
// RecruitmentScheduler — Careers/Recruitment-only background scheduler.
//
// This is a DELIBERATE, SEPARATE scheduler from utils/blogScheduler.js, not
// a reuse or extension of it. The two are logically and structurally
// independent:
//   - Blog scheduling lives entirely in blogScheduler.js / blogPublication.js
//     and is untouched by this file.
//   - Careers scheduling lives entirely here + recruitmentPublication.js.
//   - Neither imports from, calls, or depends on the other. Careers does
//     not depend on Blog scheduling running, and Blog does not depend on
//     RecruitmentScheduler running.
// Both are started independently in index.js and both follow the exact
// same startup/interval/idempotency shape on purpose (same file, same
// conventions) — that similarity is intentional consistency, not shared
// code.
// ============================================================================

// Per spec section 15: doesn't need to run every second — once a minute is
// explicitly called out as an acceptable interval, and matches the
// existing Blog scheduler's own INTERVAL_MS exactly (see blogScheduler.js).
const INTERVAL_MS = 60 * 1000;

let intervalHandle = null;

async function tick() {
  // Mirrors blogScheduler.js's own readyState guard: right at process
  // start, app.listen() and connectDB() in index.js run concurrently, so
  // the very first tick can land before Mongo is actually connected.
  // Skipping cleanly here is fine — startRecruitmentScheduler() below
  // re-runs this the moment the connection comes up.
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  try {
    await closeExpiredJobs();
  } catch (err) {
    // Spec section 14: one failed scheduled run must never crash the
    // backend or stop future runs, and must not be silently swallowed —
    // log it and let the next interval tick proceed. Never surfaced to
    // public Careers users; this only ever reaches server logs.
    console.error("[recruitment-scheduler] Failed to close expired jobs:", err.message);
  }
}

// Starts the background scheduler. Safe to call more than once — only the
// first call actually starts anything, so an accidental double
// import/call (e.g. a dev hot-reload) can't spin up a second interval
// running the close-expired-jobs query twice as often. Combined with
// closeExpiredJobs()'s own idempotent filter, running this concurrently
// or repeatedly is always safe.
export function startRecruitmentScheduler() {
  if (intervalHandle) return;

  // Restart recovery: catches up on any job that expired while the
  // server was offline, as soon as the database is actually reachable —
  // either right now (already connected) or the moment the pending
  // connectDB() call in index.js finishes.
  if (mongoose.connection.readyState === 1) {
    tick();
  } else {
    mongoose.connection.once("connected", tick);
  }

  intervalHandle = setInterval(tick, INTERVAL_MS);
  // Don't let this timer alone keep the Node process alive (relevant for
  // scripts/tests that import the app and expect a clean exit).
  intervalHandle.unref?.();
}

// Exposed only so a future test runner (or a graceful-shutdown hook, if
// one is ever added) can stop the interval. Not called anywhere today —
// the process exiting cleans it up either way.
export function stopRecruitmentScheduler() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}
