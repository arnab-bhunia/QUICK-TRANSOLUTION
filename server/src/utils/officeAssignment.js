import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import Office from "../models/Office.js";
import AdminUser from "../models/AdminUser.js";

// ============================================================================
// OFFICE ASSIGNMENT COORDINATION
//
// Invariant: an office is never inactive while any account is assigned to it,
// and nothing can be newly assigned to an inactive office — even when
// assignment and deactivation race, an assignment is slow, a worker stalls or
// dies, or the database fails part-way through.
//
// Two strategies, chosen at runtime. Both are safe; neither uses time to
// decide whether an in-flight assignment still "counts".
//
// 1. TRANSACTIONS (replica set / sharded cluster, e.g. Atlas)
//    Assignment and deactivation both WRITE the same office document inside a
//    transaction (assign bumps assignmentVersion), so overlapping attempts get
//    a write conflict and are retried; the retry sees the other's committed
//    result. Any failure aborts everything.
//
// 2. RESERVATION + FENCED LOCK (standalone mongod, no transactions)
//    Every step is a conditional atomic update of the single office document:
//      assign:     office must be active and NOT locked  ->  pendingAssignments++
//                  ... insert the account ...             ->  pendingAssignments-- (finally)
//      deactivate: ONE atomic update that requires active + no reservation
//                  (pendingAssignments == 0) + no live lock, and sets a lock
//                  carrying a random FENCING TOKEN. Once held, no new
//                  reservation can start and none is in flight, so the
//                  account count taken next is exact and cannot change.
//                  Finalise = ONE atomic update, conditional on still holding
//                  the same token, that flips isActive and writes the audit
//                  fields + history entry.
//    Why this is safe where the old lease was not:
//      - An in-flight assignment's reservation is NEVER expired by time. A
//        slow or stalled assignment keeps blocking deactivation for as long as
//        it runs, so it can never commit onto an already-deactivated office.
//        (If a worker dies mid-assignment the reservation stays, and
//        deactivation fails CLOSED until an operator clears it — see README
//        note in the merge guide. That can only delay a deactivation.)
//      - The deactivation lock may be taken over after LOCK_STALE_MS, but only
//        for liveness: every finalise is fenced by its token, so a stalled
//        deactivator whose lock was taken over simply fails its finalise.
// ============================================================================

export const LOCK_STALE_MS = 30_000; // liveness only — never used to ignore a reservation
let lockStaleMs = LOCK_STALE_MS;
export function setLockStaleMsForTests(ms) {
  lockStaleMs = ms ?? LOCK_STALE_MS;
}

export class OfficeRuleError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "OfficeRuleError";
    this.status = status;
  }
}

export function assignedAccountsMessage(count) {
  return (
    `This office cannot be deactivated because ${count} account${count === 1 ? " is" : "s are"} ` +
    `still assigned to it. Every account counts (staff, manager, HR and admin), because accounts ` +
    `do not have a separate active/inactive status. Reassign them first.`
  );
}

const BUSY = "That office is being changed right now. Please try again in a moment.";

// ---- strategy selection ----------------------------------------------------

let forcedMode = null; // "transaction" | "gate" | null (auto) — for tests
let detected; // cached auto-detection result

export function setAssignmentModeForTests(mode) {
  forcedMode = mode;
}

export async function useTransactions() {
  if (forcedMode) return forcedMode === "transaction";
  if (detected !== undefined) return detected;
  try {
    const hello = await mongoose.connection.db.admin().command({ hello: 1 });
    detected = Boolean(hello.setName || hello.msg === "isdbgrid");
    return detected;
  } catch {
    return false; // can't tell — use the strategy that works everywhere (not cached)
  }
}

// ---- helpers ----------------------------------------------------------------

const staleCutoff = () => new Date(Date.now() - lockStaleMs);
const NO_RESERVATION = { pendingAssignments: { $not: { $gt: 0 } } }; // matches 0, negative, or missing
const UNLOCK = { $unset: { deactivationToken: "", deactivationStartedAt: "" } };

async function explainUnavailable(code, session) {
  const existing = await Office.findOne({ code }).session(session || null).lean();
  if (!existing) return new OfficeRuleError(400, "Selected office is invalid");
  if (!existing.isActive) {
    return new OfficeRuleError(400, "Selected office is inactive and cannot receive new employees");
  }
  return new OfficeRuleError(409, BUSY);
}

// Deactivation's single atomic status update: status + current-state audit
// fields + the append-only history entry all land together or not at all.
function deactivationUpdate(code, byUserId, at, { unlock }) {
  return {
    $set: { isActive: false, deactivatedBy: byUserId, deactivatedAt: at, updatedBy: byUserId },
    $push: { statusHistory: { officeCode: code, type: "DEACTIVATED", by: byUserId, at } },
    ...(unlock ? UNLOCK : {}),
  };
}

// ============================================================================
// ASSIGN: run `work(session)` (which inserts the account) under the office's
// protection. `session` is null in gate mode.
// ============================================================================
export async function withOfficeAssignment(code, work) {
  if (await useTransactions()) {
    const session = await mongoose.startSession();
    try {
      let result;
      await session.withTransaction(async () => {
        const office = await Office.findOneAndUpdate(
          { code, isActive: true },
          { $inc: { assignmentVersion: 1 } },
          { session, timestamps: false }
        );
        if (!office) throw await explainUnavailable(code, session);
        result = await work(session);
      });
      return result;
    } finally {
      await session.endSession();
    }
  }

  // ---- gate mode: take a reservation, do the work, release it ----
  const reserve = () =>
    Office.findOneAndUpdate(
      { code, isActive: true, deactivationToken: null },
      { $inc: { pendingAssignments: 1 } },
      { timestamps: false }
    );

  let reserved = await reserve();
  if (!reserved) {
    // An ABANDONED deactivation lock (its owner stalled or died) would block
    // assignments forever. Clear it — fenced by its exact token — and retry.
    // Safe: that deactivator's finalise requires this same token, so it can no
    // longer succeed.
    const blocker = await Office.findOne({ code, isActive: true }).lean();
    if (blocker?.deactivationToken && blocker.deactivationStartedAt < staleCutoff()) {
      await Office.updateOne({ code, deactivationToken: blocker.deactivationToken }, UNLOCK, { timestamps: false });
      reserved = await reserve();
    }
  }
  if (!reserved) throw await explainUnavailable(code, null);

  try {
    return await work(null);
  } finally {
    try {
      await Office.updateOne({ code }, { $inc: { pendingAssignments: -1 } }, { timestamps: false });
    } catch (err) {
      // The reservation is deliberately NOT time-expired (that was the unsafe
      // part of the old design). A leftover reservation makes deactivation of
      // this office fail closed until an operator clears it.
      console.error(`CRITICAL: failed to release assignment reservation for office ${code}`, err);
    }
  }
}

// ============================================================================
// DEACTIVATE: returns the updated Office document, or throws OfficeRuleError
// (404 / 409). Resolves only if the office really ended up inactive with zero
// assigned accounts, with deactivatedBy/At and the DEACTIVATED history entry
// written in the same atomic update.
// ============================================================================
export async function deactivateOfficeGuarded(code, byUserId) {
  if (await useTransactions()) {
    const session = await mongoose.startSession();
    try {
      let result;
      await session.withTransaction(async () => {
        const at = new Date();
        const flipped = await Office.findOneAndUpdate(
          { code, isActive: true },
          deactivationUpdate(code, byUserId, at, { unlock: false }),
          { new: true, session }
        );
        if (!flipped) {
          const existing = await Office.findOne({ code }).session(session).lean();
          throw existing
            ? new OfficeRuleError(409, "This office is already inactive")
            : new OfficeRuleError(404, "Office not found");
        }
        const assigned = await AdminUser.countDocuments({ officeCode: code }).session(session);
        if (assigned > 0) throw new OfficeRuleError(409, assignedAccountsMessage(assigned)); // aborts: nothing persists
        result = flipped;
      });
      return result;
    } finally {
      await session.endSession();
    }
  }

  // ---- gate mode ----
  const token = randomUUID();
  const locked = await Office.findOneAndUpdate(
    {
      code,
      isActive: true,
      ...NO_RESERVATION,
      $or: [{ deactivationToken: null }, { deactivationStartedAt: { $lt: staleCutoff() } }],
    },
    { $set: { deactivationToken: token, deactivationStartedAt: new Date() } },
    { timestamps: false }
  );
  if (!locked) {
    const existing = await Office.findOne({ code }).lean();
    if (!existing) throw new OfficeRuleError(404, "Office not found");
    if (!existing.isActive) throw new OfficeRuleError(409, "This office is already inactive");
    throw new OfficeRuleError(409, BUSY); // reservation in flight, or another deactivation holds the lock
  }

  const release = async () => {
    try {
      await Office.updateOne({ code, deactivationToken: token }, UNLOCK, { timestamps: false });
    } catch (err) {
      // Office stays ACTIVE; the lock becomes takeover-able after LOCK_STALE_MS.
      console.error(`Failed to release deactivation lock for office ${code}`, err);
    }
  };

  // We hold the lock with no reservation in flight, and no new reservation can
  // start, so this count is exact and stable.
  let assigned;
  try {
    assigned = await AdminUser.countDocuments({ officeCode: code });
  } catch (err) {
    await release();
    throw err; // surfaces as a 500 — never a success
  }
  if (assigned > 0) {
    await release();
    throw new OfficeRuleError(409, assignedAccountsMessage(assigned));
  }

  // Finalise: fenced by our token, in ONE atomic update.
  const done = await Office.findOneAndUpdate(
    { code, isActive: true, deactivationToken: token, ...NO_RESERVATION },
    deactivationUpdate(code, byUserId, new Date(), { unlock: true }),
    { new: true }
  );
  if (!done) {
    await release(); // no-op if the lock was already taken over
    throw new OfficeRuleError(409, "The office was changed by someone else, so it was not deactivated. Please try again.");
  }
  return done;
}
