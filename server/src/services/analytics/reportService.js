import Shipment from "../../models/Shipment.js";
import BookingRequest from "../../models/BookingRequest.js";
import ServiceEnquiry from "../../models/ServiceEnquiry.js";
import AdminUser from "../../models/AdminUser.js";
import Office from "../../models/Office.js";
import Job from "../../models/Job.js";
import JobApplication from "../../models/JobApplication.js";
import Blog from "../../models/Blog.js";

const TZ = "Asia/Kolkata";

const countBy = (Model, field, match = {}) => Model.aggregate([
  { $match: match },
  { $group: { _id: { $ifNull: [`$${field}`, "Unknown"] }, count: { $sum: 1 } } },
  { $sort: { count: -1, _id: 1 } },
]);

const trendFor = (Model, dateField, range, match = {}) => Model.aggregate([
  { $match: { ...match, [dateField]: { $gte: range.start, $lt: range.end } } },
  { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: `$${dateField}`, timezone: TZ } }, count: { $sum: 1 } } },
  { $sort: { _id: 1 } },
]);

function trendWithZeros(rows, range) {
  const values = new Map(rows.map((row) => [row._id, row.count]));
  const result = [];
  for (let cursor = new Date(range.start); cursor < range.end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(cursor);
    const date = `${parts.find((p) => p.type === "year").value}-${parts.find((p) => p.type === "month").value}-${parts.find((p) => p.type === "day").value}`;
    result.push({ date, count: values.get(date) || 0 });
  }
  return result;
}

const safeText = (value) => String(value ?? "Unknown").trim() || "Unknown";

async function shipmentReport(range) {
  const [total, inPeriod, previousPeriod, statuses, dailyRows, routes, locations] = await Promise.all([
    Shipment.countDocuments(),
    Shipment.countDocuments({ createdAt: { $gte: range.start, $lt: range.end } }),
    Shipment.countDocuments({ createdAt: { $gte: range.previousStart, $lt: range.previousEnd } }),
    countBy(Shipment, "currentStatus"),
    trendFor(Shipment, "createdAt", range),
    Shipment.aggregate([
      { $group: { _id: { origin: "$origin", destination: "$destination" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 12 },
      { $project: { _id: 0, origin: "$_id.origin", destination: "$_id.destination", label: { $concat: [{ $ifNull: ["$_id.origin", "Unknown"] }, " → ", { $ifNull: ["$_id.destination", "Unknown"] }] }, count: 1 } },
    ]),
    countBy(Shipment, "currentLocation"),
  ]);
  return { kpis: { total, inPeriod, previousPeriod }, distributions: { statuses: Object.fromEntries(statuses.map((r) => [r._id, r.count])) }, trend: trendWithZeros(dailyRows, range), breakdowns: { topRoutes: routes, currentLocations: locations.slice(0, 12).map((r) => ({ label: safeText(r._id), count: r.count })) }, notes: ["Status and location breakdowns describe the current state of shipment records.", "Route ranking is based on all recorded shipments, not only the selected period."] };
}

async function bookingReport(range) {
  const [total, inPeriod, previousPeriod, statuses, dailyRows, routes] = await Promise.all([
    BookingRequest.countDocuments(),
    BookingRequest.countDocuments({ createdAt: { $gte: range.start, $lt: range.end } }),
    BookingRequest.countDocuments({ createdAt: { $gte: range.previousStart, $lt: range.previousEnd } }),
    countBy(BookingRequest, "status"), trendFor(BookingRequest, "createdAt", range),
    BookingRequest.aggregate([{ $group: { _id: { origin: "$origin", destination: "$destination" }, count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }, { $project: { _id: 0, origin: "$_id.origin", destination: "$_id.destination", label: { $concat: [{ $ifNull: ["$_id.origin", "Unknown"] }, " → ", { $ifNull: ["$_id.destination", "Unknown"] }] }, count: 1 } }]),
  ]);
  return { kpis: { total, inPeriod, previousPeriod }, distributions: { statuses: Object.fromEntries(statuses.map((r) => [r._id, r.count])) }, trend: trendWithZeros(dailyRows, range), breakdowns: { topRoutes: routes }, notes: ["Statuses are current values. A historical conversion rate requires a complete status-event history."] };
}

async function enquiryReport(range) {
  const [total, inPeriod, previousPeriod, statuses, dailyRows, services, assigned] = await Promise.all([
    ServiceEnquiry.countDocuments(),
    ServiceEnquiry.countDocuments({ requestedAt: { $gte: range.start, $lt: range.end } }),
    ServiceEnquiry.countDocuments({ requestedAt: { $gte: range.previousStart, $lt: range.previousEnd } }),
    countBy(ServiceEnquiry, "status"), trendFor(ServiceEnquiry, "requestedAt", range),
    countBy(ServiceEnquiry, "serviceTitle"),
    ServiceEnquiry.countDocuments({ assignedTo: { $ne: null } }),
  ]);
  return { kpis: { total, inPeriod, previousPeriod, assigned }, distributions: { statuses: Object.fromEntries(statuses.map((r) => [r._id, r.count])) }, trend: trendWithZeros(dailyRows, range), breakdowns: { byService: services.slice(0, 12).map((r) => ({ label: safeText(r._id), count: r.count })) }, notes: ["Contact details and message content are excluded."] };
}

async function workforceReport(range) {
  const nonAdmin = { role: { $ne: "admin" } };
  const [total, createdInPeriod, roles, officeStatuses, officeCount, activeOfficeCount, officeStaff, createdTrend] = await Promise.all([
    AdminUser.countDocuments(nonAdmin),
    AdminUser.countDocuments({ ...nonAdmin, createdAt: { $gte: range.start, $lt: range.end } }),
    countBy(AdminUser, "role", nonAdmin),
    countBy(Office, "isActive"), Office.countDocuments(), Office.countDocuments({ isActive: true }),
    AdminUser.aggregate([{ $match: { ...nonAdmin, officeCode: { $nin: [null, ""] } } }, { $group: { _id: "$officeCode", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 15 }, { $lookup: { from: "offices", localField: "_id", foreignField: "code", as: "office" } }, { $project: { _id: 0, officeCode: "$_id", label: { $ifNull: [{ $arrayElemAt: ["$office.name", 0] }, "$_id"] }, count: 1 } }]),
    trendFor(AdminUser, "createdAt", range, nonAdmin),
  ]);
  return { kpis: { total, createdInPeriod, officeCount, activeOfficeCount }, distributions: { roles: Object.fromEntries(roles.map((r) => [r._id, r.count])), offices: Object.fromEntries(officeStatuses.map((r) => [String(r._id), r.count])) }, trend: trendWithZeros(createdTrend, range), breakdowns: { staffByOffice: officeStaff }, notes: ["The creation trend is not a login or activity trend; login history is not currently recorded.", "Office assignment breakdown reflects current employee assignments."] };
}

async function recruitmentReport(range) {
  const [applications, applicationsInPeriod, previousPeriod, applicationStatuses, applicationTrend, jobsByStatus, applicationsByJob, jobsTotal, openJobs] = await Promise.all([
    JobApplication.countDocuments(),
    JobApplication.countDocuments({ createdAt: { $gte: range.start, $lt: range.end } }),
    JobApplication.countDocuments({ createdAt: { $gte: range.previousStart, $lt: range.previousEnd } }),
    countBy(JobApplication, "status"), trendFor(JobApplication, "createdAt", range),
    countBy(Job, "status"),
    JobApplication.aggregate([{ $group: { _id: { job: "$job", title: "$jobTitleSnapshot" }, count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 12 }, { $project: { _id: 0, jobId: "$_id.job", label: { $ifNull: ["$_id.title", "Untitled job"] }, count: 1 } }]),
    Job.countDocuments(), Job.countDocuments({ status: "OPEN" }),
  ]);
  return { kpis: { applications, applicationsInPeriod, previousPeriod, jobsTotal, openJobs }, distributions: { applicationStatuses: Object.fromEntries(applicationStatuses.map((r) => [r._id, r.count])), jobStatuses: Object.fromEntries(jobsByStatus.map((r) => [r._id, r.count])) }, trend: trendWithZeros(applicationTrend, range), breakdowns: { applicationsByJob }, notes: ["Applicant identity, answers, resume metadata, notes and IP information are excluded.", "Application statuses are current values; time-to-stage metrics require reliable event timestamps."] };
}

async function contentReport(range) {
  const [total, createdInPeriod, previousPeriod, statuses, types, categories, publishedInPeriod, scheduledCount, createdTrend] = await Promise.all([
    Blog.countDocuments(), Blog.countDocuments({ createdAt: { $gte: range.start, $lt: range.end } }), Blog.countDocuments({ createdAt: { $gte: range.previousStart, $lt: range.previousEnd } }),
    countBy(Blog, "status"), countBy(Blog, "contentType"), countBy(Blog, "category"),
    Blog.countDocuments({ publishedAt: { $gte: range.start, $lt: range.end } }), Blog.countDocuments({ status: "scheduled" }), trendFor(Blog, "createdAt", range),
  ]);
  return { kpis: { total, createdInPeriod, previousPeriod, publishedInPeriod, scheduledCount }, distributions: { statuses: Object.fromEntries(statuses.map((r) => [r._id, r.count])), types: Object.fromEntries(types.map((r) => [r._id, r.count])) }, trend: trendWithZeros(createdTrend, range), breakdowns: { categories: categories.slice(0, 15).map((r) => ({ label: safeText(r._id), count: r.count })) }, notes: ["This is content inventory and publication activity, not readership or engagement. Page views are not currently recorded."] };
}

const REPORTS = { shipments: shipmentReport, bookings: bookingReport, enquiries: enquiryReport, workforce: workforceReport, recruitment: recruitmentReport, content: contentReport };

export async function getAnalyticsReport(name, range) {
  const handler = REPORTS[String(name || "").toLowerCase()];
  if (!handler) {
    const error = new Error("Unsupported analytics report.");
    error.status = 404;
    throw error;
  }
  const data = await handler(range);
  return { meta: { report: name, period: range.period, label: range.label, timeZone: range.timeZone, start: range.start, end: range.end, previousStart: range.previousStart, previousEnd: range.previousEnd }, ...data };
}
