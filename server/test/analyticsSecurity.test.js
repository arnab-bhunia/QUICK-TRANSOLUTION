import test from "node:test";
import assert from "node:assert/strict";
import analyticsRoutes from "../src/routes/analyticsRoutes.js";
import { requireAdminRole } from "../src/middleware/auth.js";
import { buildExplorerQuery, getAnalyticsExplorer } from "../src/services/analytics/explorerService.js";

const RANGE = {
  period: "7d",
  start: new Date("2026-10-12T18:30:00.000Z"),
  end: new Date("2026-10-19T18:30:00.000Z"),
};

function responseRecorder() {
  return {
    statusCode: 200,
    payload: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; },
  };
}

test("analytics routes require both authentication and admin authorization", () => {
  const protectedPaths = new Set(["/overview", "/explorer", "/explorer/export", "/reports/:report"]);
  const registered = analyticsRoutes.stack.filter((layer) => layer.route);
  assert.equal(registered.length, protectedPaths.size);
  for (const layer of registered) {
    assert.ok(protectedPaths.has(layer.route.path), `Unexpected analytics route ${layer.route.path}`);
    const handlerNames = layer.route.stack.map((entry) => entry.handle.name);
    assert.ok(handlerNames.includes("requireAuth"), `${layer.route.path} must require authentication`);
    assert.ok(handlerNames.includes("requireAdminRole"), `${layer.route.path} must require an administrator`);
  }
});

test("admin authorization denies missing and non-admin users", () => {
  for (const user of [undefined, { role: "staff" }, { role: "manager" }, { role: "hr" }]) {
    const req = { user };
    const res = responseRecorder();
    let nextCalled = false;
    requireAdminRole(req, res, () => { nextCalled = true; });
    assert.equal(res.statusCode, 403);
    assert.equal(res.payload.message, "Admin access required");
    assert.equal(nextCalled, false);
  }
});

test("admin authorization allows an administrator", () => {
  let nextCalled = false;
  const res = responseRecorder();
  requireAdminRole({ user: { role: "admin" } }, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
});

test("explorer query builder only accepts a status from the dataset allowlist", () => {
  const config = { dateField: "createdAt", statusField: "currentStatus", searchFields: ["trackingId"] };
  assert.throws(
    () => buildExplorerQuery({ status: "admin" }, RANGE, config, "shipments"),
    (error) => error.status === 400 && /invalid status/i.test(error.message),
  );
});

test("explorer query builder preserves exclusive end boundary and escapes search regex", () => {
  const config = { dateField: "createdAt", statusField: "currentStatus", searchFields: ["trackingId"] };
  const result = buildExplorerQuery({ search: ".*", status: "delivered" }, RANGE, config, "shipments");
  assert.deepEqual(result.match.createdAt, { $gte: RANGE.start, $lt: RANGE.end });
  assert.equal(result.match.currentStatus, "delivered");
  assert.equal(result.match.$or[0].trackingId.source, "\\.\\*");
  assert.equal(result.search, ".*");
});

test("explorer rejects unsupported datasets before any database query", async () => {
  await assert.rejects(
    getAnalyticsExplorer({ entity: "users;drop" }, RANGE),
    (error) => error.status === 400 && /unsupported explorer dataset/i.test(error.message),
  );
});

test("explorer projections exclude high-risk personal and internal fields", async () => {
  const { getAnalyticsExplorerColumns } = await import("../src/services/analytics/explorerService.js");
  const forbidden = /password|email|phone|mobile|address|message|resume|answer|note|ipaddress|useragent|consent/i;
  for (const dataset of ["shipments", "bookings", "enquiries", "applications", "jobs", "content", "offices", "team"]) {
    const columns = getAnalyticsExplorerColumns(dataset);
    assert.ok(columns.length > 0, `${dataset} should have an explicit projection`);
    assert.ok(columns.every((column) => !forbidden.test(column)), `${dataset} projection must not expose sensitive fields`);
    assert.ok(!columns.includes("_id"), `${dataset} projection should not expose internal Mongo identifiers`);
  }
});

test("explorer projection contract rejects unknown dataset names", async () => {
  const { getAnalyticsExplorerColumns } = await import("../src/services/analytics/explorerService.js");
  assert.throws(() => getAnalyticsExplorerColumns("auditLogs"), (error) => error.status === 400);
});
