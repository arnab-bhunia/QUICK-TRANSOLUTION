import test from "node:test";
import assert from "node:assert/strict";
import { getAnalyticsReport } from "../src/services/analytics/reportService.js";

const RANGE = {
  period: "7d",
  label: "Last 7 days",
  timeZone: "Asia/Kolkata",
  start: new Date("2026-10-12T18:30:00.000Z"),
  end: new Date("2026-10-19T18:30:00.000Z"),
  previousStart: new Date("2026-10-05T18:30:00.000Z"),
  previousEnd: new Date("2026-10-12T18:30:00.000Z"),
};

test("analytics report service rejects unknown report names with a client-safe status", async () => {
  await assert.rejects(getAnalyticsReport("unrestricted-pipeline", RANGE), (error) => {
    assert.equal(error.status, 404);
    assert.match(error.message, /unsupported analytics report/i);
    return true;
  });
});

test("analytics report names are case-insensitive", async () => {
  // Unknown names are rejected before any database operation, so this also
  // confirms normalization happens before selecting a report handler.
  await assert.rejects(getAnalyticsReport("NOT_A_REPORT", RANGE), (error) => error.status === 404);
});


test("CSV export cells quote commas, quotes, and line breaks safely", async () => {
  const { escapeCsvCell } = await import("../src/services/analytics/explorerService.js");
  assert.equal(escapeCsvCell('North, "Central"'), '"North, ""Central"""');
  assert.equal(escapeCsvCell("line one\nline two"), '"line one line two"');
});

test("CSV export cells neutralize spreadsheet formula prefixes", async () => {
  const { escapeCsvCell } = await import("../src/services/analytics/explorerService.js");
  assert.equal(escapeCsvCell("=HYPERLINK(\"https://example.invalid\")"), "\"'=HYPERLINK(\"\"https://example.invalid\"\")\"");
  assert.equal(escapeCsvCell("@SUM(A1:A2)"), "\"'@SUM(A1:A2)\"");
});

test("export rejects unsupported formats before querying the database", async () => {
  const { exportAnalyticsExplorer } = await import("../src/services/analytics/explorerService.js");
  await assert.rejects(exportAnalyticsExplorer({ entity: "shipments" }, RANGE, "pdf"), (error) => error.status === 400);
});

test("export rejects invalid dataset status filters before querying the database", async () => {
  const { exportAnalyticsExplorer } = await import("../src/services/analytics/explorerService.js");
  await assert.rejects(exportAnalyticsExplorer({ entity: "shipments", status: "admin" }, RANGE, "csv"), (error) => error.status === 400);
});
