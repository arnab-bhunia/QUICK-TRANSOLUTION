import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Shipment from "../src/models/Shipment.js";
import BookingRequest from "../src/models/BookingRequest.js";
import { getAnalyticsReport } from "../src/services/analytics/reportService.js";
import { getAnalyticsExplorer, exportAnalyticsExplorer } from "../src/services/analytics/explorerService.js";

const RANGE = {
  period: "custom",
  label: "2026-10-10 to 2026-10-12",
  timeZone: "Asia/Kolkata",
  start: new Date("2026-10-09T18:30:00.000Z"),
  end: new Date("2026-10-12T18:30:00.000Z"),
  previousStart: new Date("2026-10-06T18:30:00.000Z"),
  previousEnd: new Date("2026-10-09T18:30:00.000Z"),
};

let mongo;
let connected = false;

test("database-backed Analytics report, explorer, and export contracts", async (t) => {
  try {
    mongo = await MongoMemoryServer.create();
  } catch (error) {
    t.skip(`MongoDB memory server unavailable in this environment: ${error.message}`);
    return;
  }

  await mongoose.connect(mongo.getUri());
  connected = true;
  t.after(async () => {
    if (connected) await mongoose.disconnect();
    if (mongo) await mongo.stop();
  });

  await Promise.all([Shipment.deleteMany({}), BookingRequest.deleteMany({})]);
  const adminId = new mongoose.Types.ObjectId();
  const customerId = new mongoose.Types.ObjectId();

  await Shipment.create([
    {
      trackingId: "QT-INT-001", senderName: "Sender One", senderPhone: "9999999991",
      receiverName: "Receiver One", receiverPhone: "9999999992", origin: "Kolkata", destination: "Delhi",
      currentStatus: "in_transit", currentLocation: "Patna", createdBy: adminId,
      createdAt: new Date("2026-10-10T05:00:00.000Z"), updatedAt: new Date("2026-10-10T05:00:00.000Z"),
    },
    {
      trackingId: "QT-INT-002", senderName: "Sender Two", senderPhone: "9999999993",
      receiverName: "Receiver Two", receiverPhone: "9999999994", origin: "Kolkata", destination: "Mumbai",
      currentStatus: "delivered", currentLocation: "Mumbai", createdBy: adminId,
      createdAt: new Date("2026-10-11T05:00:00.000Z"), updatedAt: new Date("2026-10-11T05:00:00.000Z"),
    },
    {
      trackingId: "QT-INT-003", senderName: "Sender Three", senderPhone: "9999999995",
      receiverName: "Receiver Three", receiverPhone: "9999999996", origin: "Delhi", destination: "Chennai",
      currentStatus: "booked", currentLocation: "Delhi", createdBy: adminId,
      createdAt: new Date("2026-10-13T05:00:00.000Z"), updatedAt: new Date("2026-10-13T05:00:00.000Z"),
    },
  ]);

  await BookingRequest.create([
    { customer: customerId, origin: "Kolkata", destination: "Delhi", cargoDetails: "Boxes", status: "pending", createdAt: new Date("2026-10-10T05:00:00.000Z"), updatedAt: new Date("2026-10-10T05:00:00.000Z") },
    { customer: customerId, origin: "Kolkata", destination: "Delhi", cargoDetails: "Pallets", status: "converted", createdAt: new Date("2026-10-11T05:00:00.000Z"), updatedAt: new Date("2026-10-11T05:00:00.000Z") },
  ]);

  const shipmentReport = await getAnalyticsReport("shipments", RANGE);
  assert.equal(shipmentReport.kpis.total, 3);
  assert.equal(shipmentReport.kpis.inPeriod, 2);
  assert.equal(shipmentReport.distributions.statuses.in_transit, 1);
  assert.equal(shipmentReport.distributions.statuses.delivered, 1);
  assert.equal(shipmentReport.trend.length, 3);
  assert.deepEqual(shipmentReport.trend.map((item) => item.date), ["2026-10-10", "2026-10-11", "2026-10-12"]);
  assert.deepEqual(shipmentReport.trend.map((item) => item.count), [1, 1, 0]);

  const explorer = await getAnalyticsExplorer({ entity: "shipments", page: "1", pageSize: "10" }, RANGE);
  const exported = await exportAnalyticsExplorer({ entity: "shipments" }, RANGE, "csv");
  assert.equal(explorer.total, 2);
  assert.equal(exported.total, explorer.total);
  assert.deepEqual(exported.columns, explorer.columns);
  assert.deepEqual(exported.rows.map((row) => row.trackingId).sort(), explorer.rows.map((row) => row.trackingId).sort());
  assert.ok(exported.rows.every((row) => !("senderPhone" in row) && !("receiverPhone" in row) && !("senderName" in row)));

  const filtered = await getAnalyticsExplorer({ entity: "shipments", status: "delivered", search: "QT-INT-002" }, RANGE);
  assert.equal(filtered.total, 1);
  assert.equal(filtered.rows[0].trackingId, "QT-INT-002");

  const bookingReport = await getAnalyticsReport("bookings", RANGE);
  assert.equal(bookingReport.kpis.total, 2);
  assert.equal(bookingReport.kpis.inPeriod, 2);
  assert.equal(bookingReport.distributions.statuses.pending, 1);
  assert.equal(bookingReport.distributions.statuses.converted, 1);
});
