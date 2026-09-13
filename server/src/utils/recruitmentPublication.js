import Job from "../models/Job.js";
import AuditLog from "../models/AuditLog.js";

// ============================================================================
// Single source of truth for "auto-close any OPEN job whose closingDate has
// passed" — the Careers equivalent of utils/blogPublication.js's
// promoteDueScheduledPosts(). Used by the background RecruitmentScheduler
// (utils/recruitmentScheduler.js) and safe to call from anywhere else that
// might one day want the same effect (e.g. a manual admin "run now" action),
// exactly the way blogPublication.js is shared between the scheduler and
// blogController.js's lazy-promotion calls.
//
// RACE-SAFETY (hardening: atomic + race-safe automatic-close auditing)
// The state transition happens ONE JOB AT A TIME via
// Job.findOneAndUpdate({_id, status:"OPEN", closingDate:{$lte:now}}, {$set:
// {status:"CLOSED"}}, {new:true}) — a single atomic MongoDB operation. If
// two scheduler ticks (or two server instances) race on the same job, only
// ONE findOneAndUpdate() call can actually match+modify the document: the
// first one flips status to CLOSED, and the moment that happens the
// document stops matching `status: "OPEN"` for anyone else. The loser's
// call finds nothing and gets back `null` — it never sees a "success"
// result, so it never creates an audit entry. The AuditLog write only ever
// happens in the branch that received the actual updated document back
// from MongoDB, i.e. only for the execution that truly performed the
// transition. This is deliberately NOT "updateMany() then re-query by
// status" — a later `status: "CLOSED"` read can't tell you WHICH execution
// performed the transition (it might have been a concurrent one, or even a
// manual admin close), which is exactly the bug this function avoids.
//
// IDEMPOTENCY
// Once a job is CLOSED, it can never match the `status: "OPEN"` filter
// again, so any later tick (run seconds, minutes, or restarts later)
// simply won't find it as a candidate at all — no change, no audit, no
// side effects, no matter how many times this function runs.
//
// MANUAL-CLOSE SAFETY
// The filter only ever matches documents CURRENTLY "OPEN" — a job HR has
// already manually moved to CLOSED/ARCHIVED (or left in DRAFT) will never
// match, so this function can only ever perform OPEN → CLOSED for expired
// jobs. It never touches CLOSED, ARCHIVED, or DRAFT jobs, and therefore can
// never "reopen" anything.
// ============================================================================
export async function closeExpiredJobs() {
  const now = new Date(); // server time only — never trusted from a caller
  const filter = { status: "OPEN", closingDate: { $ne: null, $lte: now } };

  // A read purely to know WHICH jobs are candidates (so we know what to
  // attempt below) — it plays no part in the actual state change and is
  // NOT what determines whether an audit gets written. Two concurrent
  // executions may both see the same candidate here; that's fine, because
  // each one still has to win its own atomic findOneAndUpdate() below.
  const candidateIds = await Job.find(filter).distinct("_id");
  if (candidateIds.length === 0) {
    return { closedCount: 0, attemptedCount: 0 };
  }

  let closedCount = 0;

  // Sequential per-job processing (rather than firing all
  // findOneAndUpdate() calls in parallel) keeps this simple and
  // predictable — job volume here is small (expired-today jobs, not the
  // whole collection) and each job's own atomicity comes from MongoDB
  // itself, not from JS-level concurrency control, so there's no
  // correctness reason to parallelize. One job's failure is caught and
  // logged without aborting the rest (spec: scheduler error handling).
  for (const jobId of candidateIds) {
    let closedJob;
    try {
      // THE atomic transition: only the execution whose update actually
      // matches (still "OPEN" AND still past its closingDate at the
      // instant MongoDB applies this) gets a non-null document back.
      closedJob = await Job.findOneAndUpdate(
        { _id: jobId, status: "OPEN", closingDate: { $ne: null, $lte: now } },
        { $set: { status: "CLOSED" } },
        { new: true }
      ).select("_id title closingDate");
    } catch (err) {
      console.error(`[recruitment-publication] Failed to close job ${jobId}:`, err.message);
      continue; // one bad job must not stop the rest
    }

    // null means this execution LOST the race (or the job was manually
    // closed/archived in the meantime, or no longer qualifies) — someone
    // else already performed the transition, or there was nothing to do.
    // Either way: no state change happened here, so no audit is written.
    if (!closedJob) continue;

    closedCount++;

    // Only reached by the single execution that actually won the
    // transition for this job — so exactly one job_closed AuditLog is
    // ever created per automatic closure, no matter how many concurrent
    // scheduler executions were racing on it. `performedBy: null` is this
    // codebase's existing convention for a system/non-staff-initiated
    // AuditLog entry (see models/AuditLog.js); the scheduler identifies
    // itself via the `after.closedBy` marker since there's no separate
    // "actor type" field in the existing audit schema to extend for this.
    try {
      await AuditLog.create({
        job: closedJob._id,
        action: "job_closed",
        performedBy: null,
        before: { status: "OPEN" },
        after: {
          status: "CLOSED",
          closedBy: "system:recruitment-scheduler",
          closingDate: closedJob.closingDate,
        },
      });
    } catch (err) {
      // The state transition already succeeded and is not rolled back —
      // losing the audit write is logged, not swallowed, but must not
      // stop the rest of the batch (spec: scheduler error handling).
      console.error(
        `[recruitment-publication] Job ${closedJob._id} was closed but its audit log failed to write:`,
        err.message
      );
    }

    console.log(`[recruitment-publication] Auto-closed expired job: "${closedJob.title}" (${closedJob._id})`);
  }

  return { closedCount, attemptedCount: candidateIds.length };
}
