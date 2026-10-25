import Shipment from "../../models/Shipment.js";
import BookingRequest from "../../models/BookingRequest.js";
import ServiceEnquiry from "../../models/ServiceEnquiry.js";
import AdminUser from "../../models/AdminUser.js";
import Office from "../../models/Office.js";
import Job from "../../models/Job.js";
import JobApplication from "../../models/JobApplication.js";
import Blog from "../../models/Blog.js";
import AuditLog from "../../models/AuditLog.js";

const countBy = async (Model, field, match = {}) => Model.aggregate([
  { $match: match },
  { $group: { _id: `$${field}`, count: { $sum: 1 } } },
  { $sort: { count: -1, _id: 1 } },
]);
const mapCounts = (rows) => Object.fromEntries(rows.map((row) => [row._id ?? "unknown", row.count]));
const safeCount = async (promise) => promise;

function trendPipeline(field, start, end, extraMatch = {}) {
  return [
    { $match: { ...extraMatch, [field]: { $gte: start, $lt: end } } },
    { $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: `$${field}`, timezone: "Asia/Kolkata" } },
      count: { $sum: 1 },
    } },
    { $sort: { _id: 1 } },
  ];
}

function fillDays(start, end, shipmentRows, bookingRows, enquiryRows) {
  const byDate = new Map();
  const add = (rows, key) => rows.forEach((row) => {
    if (!byDate.has(row._id)) byDate.set(row._id, { date: row._id, shipments: 0, bookings: 0, enquiries: 0 });
    byDate.get(row._id)[key] = row.count;
  });
  add(shipmentRows, "shipments"); add(bookingRows, "bookings"); add(enquiryRows, "enquiries");
  const cursor = new Date(start);
  while (cursor < end) {
    const key = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(cursor);
    if (!byDate.has(key)) byDate.set(key, { date: key, shipments: 0, bookings: 0, enquiries: 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export async function getAnalyticsOverview(range) {
  const currentCreated = { $gte: range.start, $lt: range.end };
  const previousCreated = { $gte: range.previousStart, $lt: range.previousEnd };
  const [
    totalShipments, totalBookings, totalEnquiries, totalApplications, totalJobs,
    activeJobs, totalBlogs, publishedBlogs, totalStaff, totalOffices, activeOffices,
    shipmentStatusRows, bookingStatusRows, enquiryStatusRows, applicationStatusRows, blogStatusRows,
    shipmentTrend, bookingTrend, enquiryTrend, previousShipments, previousBookings,
    previousEnquiries, previousApplications, newShipments, newBookings, newEnquiries,
    newApplications, staffByRole, officeByStatus, routeRows, recentActivity,
  ] = await Promise.all([
    safeCount(Shipment.countDocuments()), safeCount(BookingRequest.countDocuments()),
    safeCount(ServiceEnquiry.countDocuments()), safeCount(JobApplication.countDocuments()),
    safeCount(Job.countDocuments()), safeCount(Job.countDocuments({ status: "OPEN" })),
    safeCount(Blog.countDocuments()), safeCount(Blog.countDocuments({ status: "published" })),
    safeCount(AdminUser.countDocuments({ role: { $ne: "admin" } })), safeCount(Office.countDocuments()), safeCount(Office.countDocuments({ isActive: true })),
    countBy(Shipment, "currentStatus"), countBy(BookingRequest, "status"), countBy(ServiceEnquiry, "status"), countBy(JobApplication, "status"), countBy(Blog, "status"),
    Shipment.aggregate(trendPipeline("createdAt", range.start, range.end)),
    BookingRequest.aggregate(trendPipeline("createdAt", range.start, range.end)),
    ServiceEnquiry.aggregate(trendPipeline("requestedAt", range.start, range.end)),
    Shipment.countDocuments({ createdAt: previousCreated }), BookingRequest.countDocuments({ createdAt: previousCreated }),
    ServiceEnquiry.countDocuments({ requestedAt: previousCreated }), JobApplication.countDocuments({ createdAt: previousCreated }),
    Shipment.countDocuments({ createdAt: currentCreated }), BookingRequest.countDocuments({ createdAt: currentCreated }),
    ServiceEnquiry.countDocuments({ requestedAt: currentCreated }), JobApplication.countDocuments({ createdAt: currentCreated }),
    countBy(AdminUser, "role"), countBy(Office, "isActive"),
    Shipment.aggregate([
      { $group: { _id: { origin: "$origin", destination: "$destination" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 8 },
      { $project: { _id: 0, route: { $concat: ["$_id.origin", " → ", "$_id.destination"] }, count: 1 } },
    ]),
    AuditLog.find().sort({ createdAt: -1 }).limit(8).populate("performedBy", "name role").select("action trackingId serviceEnquiry job jobApplication performedBy createdAt -_id"),
  ]);

  const trend = fillDays(range.start, range.end, shipmentTrend, bookingTrend, enquiryTrend);
  return {
    meta: { period: range.period, label: range.label, timeZone: range.timeZone, start: range.start, end: range.end, previousStart: range.previousStart, previousEnd: range.previousEnd },
    kpis: {
      shipments: { total: totalShipments, period: newShipments, previousPeriod: previousShipments },
      bookings: { total: totalBookings, period: newBookings, previousPeriod: previousBookings },
      enquiries: { total: totalEnquiries, period: newEnquiries, previousPeriod: previousEnquiries },
      applications: { total: totalApplications, period: newApplications, previousPeriod: previousApplications },
      jobs: { total: totalJobs, active: activeJobs },
      content: { total: totalBlogs, published: publishedBlogs },
      workforce: { total: totalStaff, offices: totalOffices, activeOffices },
    },
    distributions: {
      shipmentsByStatus: mapCounts(shipmentStatusRows), bookingsByStatus: mapCounts(bookingStatusRows),
      enquiriesByStatus: mapCounts(enquiryStatusRows), applicationsByStatus: mapCounts(applicationStatusRows), blogsByStatus: mapCounts(blogStatusRows),
      staffByRole: mapCounts(staffByRole), officesByStatus: mapCounts(officeByStatus),
    },
    trend,
    topRoutes: routeRows,
    recentActivity: recentActivity.map((entry) => ({
      action: entry.action, trackingId: entry.trackingId || null,
      entity: entry.serviceEnquiry ? "Service enquiry" : entry.jobApplication ? "Job application" : entry.job ? "Job" : entry.trackingId ? "Shipment" : "System activity",
      performedBy: entry.performedBy ? { name: entry.performedBy.name, role: entry.performedBy.role } : null,
      createdAt: entry.createdAt,
    })),
  };
}
