import test from "node:test";
import assert from "node:assert/strict";
import { resolveAnalyticsRange } from "../src/utils/analytics/dateRange.js";

const FIXED_NOW = new Date("2026-10-19T14:00:00.000Z");

test("analytics date ranges use Asia/Kolkata day boundaries", () => {
  const range = resolveAnalyticsRange({ period: "today" }, FIXED_NOW);
  assert.equal(range.timeZone, "Asia/Kolkata");
  assert.equal(range.start.toISOString(), "2026-10-18T18:30:00.000Z");
  assert.equal(range.end.toISOString(), "2026-10-19T18:30:00.000Z");
});

test("analytics rolling ranges include the current reporting day", () => {
  const range = resolveAnalyticsRange({ period: "7d" }, FIXED_NOW);
  assert.equal(range.end.getTime() - range.start.getTime(), 7 * 24 * 60 * 60 * 1000);
  assert.equal(range.previousEnd.getTime(), range.start.getTime());
  assert.equal(range.previousEnd.getTime() - range.previousStart.getTime(), range.end.getTime() - range.start.getTime());
});

test("custom analytics range is inclusive of its end date", () => {
  const range = resolveAnalyticsRange({ period: "custom", start: "2026-10-01", end: "2026-10-03" }, FIXED_NOW);
  assert.equal(range.end.getTime() - range.start.getTime(), 3 * 24 * 60 * 60 * 1000);
});

test("custom analytics ranges reject invalid and excessively long dates", () => {
  assert.throws(() => resolveAnalyticsRange({ period: "custom", start: "2026-02-30", end: "2026-03-02" }, FIXED_NOW), /invalid/i);
  assert.throws(() => resolveAnalyticsRange({ period: "custom", start: "2025-01-01", end: "2026-12-31" }, FIXED_NOW), /366 days/i);
});

test("unsupported analytics periods are rejected", () => {
  assert.throws(() => resolveAnalyticsRange({ period: "all-time" }, FIXED_NOW), /Unsupported/i);
});
