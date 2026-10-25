import Shipment from "../../models/Shipment.js";
import BookingRequest from "../../models/BookingRequest.js";
import ServiceEnquiry from "../../models/ServiceEnquiry.js";
import JobApplication from "../../models/JobApplication.js";
import Job from "../../models/Job.js";
import Blog from "../../models/Blog.js";
import Office from "../../models/Office.js";
import AdminUser from "../../models/AdminUser.js";

// Publicly safe analytics columns only. Do not add encrypted or decrypted
// contact details, resumes, internal notes, IP addresses, or consent payloads.
const DATASETS = {
  shipments: {
    model: Shipment, dateField: "createdAt", statusField: "currentStatus",
    searchFields: ["trackingId", "origin", "destination", "currentLocation"],
    select: "trackingId origin destination currentStatus currentLocation createdAt estimatedDelivery",
  },
  bookings: {
    model: BookingRequest, dateField: "createdAt", statusField: "status",
    searchFields: ["origin", "destination"],
    select: "origin destination status preferredDate createdAt",
  },
  enquiries: {
    model: ServiceEnquiry, dateField: "requestedAt", statusField: "status",
    searchFields: ["serviceTitle", "serviceSlug"],
    select: "serviceTitle serviceSlug status requestedAt createdAt",
  },
  applications: {
    model: JobApplication, dateField: "createdAt", statusField: "status",
    searchFields: ["applicationId", "jobTitleSnapshot", "source"],
    select: "applicationId jobTitleSnapshot status source createdAt",
  },
  jobs: {
    model: Job, dateField: "createdAt", statusField: "status",
    searchFields: ["title", "department", "location"],
    select: "title department employmentType location workMode status createdAt publishedAt",
  },
  content: {
    model: Blog, dateField: "createdAt", statusField: "status",
    searchFields: ["title", "category", "slug"],
    select: "title slug category contentType status createdAt publishedAt",
  },
  offices: {
    model: Office, dateField: "createdAt", statusField: "isActive",
    searchFields: ["code", "name", "city", "state"],
    select: "code name city state isActive createdAt updatedAt",
  },
  team: {
    model: AdminUser, dateField: "createdAt", statusField: "role",
    searchFields: ["name", "role", "officeCode"],
    select: "name role officeCode createdAt lastLoginAt",
    baseMatch: { role: { $ne: "admin" } },
  },
};

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const STATUS_ALLOWLIST = {
  shipments: ["booked", "picked_up", "in_transit", "out_for_delivery", "delivered", "on_hold"],
  bookings: ["pending", "contacted", "converted", "rejected"],
  enquiries: ["new", "contacted", "closed"],
  applications: ["NEW", "REVIEWING", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED", "WITHDRAWN"],
  jobs: ["DRAFT", "OPEN", "CLOSED", "ARCHIVED"],
  content: ["draft", "scheduled", "published"],
  offices: ["true", "false"],
  team: ["hr", "manager", "staff", "content_writer"],
};
const MAX_EXPORT_ROWS = 5000;

// Expose only the explicit projection contract for tests and UI metadata.
// The underlying Mongoose models and query configuration remain private.
export function getAnalyticsExplorerColumns(entityName) {
  const entity = String(entityName || "").toLowerCase();
  const config = DATASETS[entity];
  if (!config) {
    const error = new Error("Unsupported explorer dataset.");
    error.status = 400;
    throw error;
  }
  return config.select.split(" ").filter((field) => field && !field.startsWith("-") && field !== "_id");
}

export function buildExplorerQuery(query, range, config, entity) {
  const search = String(query.search || "").trim().slice(0, 100);
  const status = String(query.status || "").trim().slice(0, 50);
  const match = { ...(config.baseMatch || {}), [config.dateField]: { $gte: range.start, $lt: range.end } };
  if (status) {
    if (!(STATUS_ALLOWLIST[entity] || []).includes(status)) {
      const error = new Error("Invalid status filter for this dataset."); error.status = 400; throw error;
    }
    if (config.statusField === "isActive") match.isActive = status === "true";
    else match[config.statusField] = status;
  }
  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    match.$or = config.searchFields.map((field) => ({ [field]: regex }));
  }
  return { match, search, status };
}

function exportSafeValue(value) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "boolean") return value ? "Active" : "Inactive";
  if (typeof value === "object") return JSON.stringify(value);
  const text = String(value);
  // Prevent spreadsheet formula injection in CSV/XLSX exports.
  return /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
}

export function escapeCsvCell(value) {
  const safe = exportSafeValue(value).replace(/\r?\n/g, " ");
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function getAnalyticsExplorer(query, range) {
  const entity = String(query.entity || "shipments").toLowerCase();
  const config = DATASETS[entity];
  if (!config) {
    const error = new Error("Unsupported explorer dataset.");
    error.status = 400;
    throw error;
  }
  const page = Math.max(1, Math.min(100_000, Number.parseInt(query.page, 10) || 1));
  const pageSize = Math.max(10, Math.min(100, Number.parseInt(query.pageSize, 10) || 25));
  const { match, search, status } = buildExplorerQuery(query, range, config, entity);
  const columns = getAnalyticsExplorerColumns(entity);

  const [total, rows] = await Promise.all([
    config.model.countDocuments(match),
    config.model.find(match).select(`${config.select} -_id`).sort({ [config.dateField]: -1, _id: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
  ]);

  return {
    entity,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    filters: { search, status, period: range.period, start: range.start, end: range.end },
    columns,
    rows: rows.map((row) =>
      Object.fromEntries(
        columns.map((column) => [column, row[column]])
      )
    ),
  };
}

export async function exportAnalyticsExplorer(query, range, format) {
  const entity = String(query.entity || "shipments").toLowerCase();
  const config = DATASETS[entity];
  if (!config) {
    const error = new Error("Unsupported explorer dataset."); error.status = 400; throw error;
  }
  if (!["csv", "xlsx"].includes(format)) {
    const error = new Error("Unsupported export format. Choose CSV or Excel."); error.status = 400; throw error;
  }
  const { match, search, status } = buildExplorerQuery(query, range, config, entity);
  const total = await config.model.countDocuments(match);
  if (total > MAX_EXPORT_ROWS) {
    const error = new Error(`This export matches ${total.toLocaleString("en-IN")} records. Narrow the filters to ${MAX_EXPORT_ROWS.toLocaleString("en-IN")} records or fewer.`);
    error.status = 413;
    throw error;
  }
  const columns = getAnalyticsExplorerColumns(entity);
  const rows = await config.model.find(match).select(`${config.select} -_id`).sort({ [config.dateField]: -1, _id: -1 }).limit(MAX_EXPORT_ROWS + 1).lean();
  const safeRows = rows.map((row) => Object.fromEntries(columns.map((column) => [column, exportSafeValue(row[column])])));
  return { entity, columns, rows: safeRows, total, filters: { searchApplied: Boolean(search), status: status || "", period: range.period, start: range.start, end: range.end }, maxRows: MAX_EXPORT_ROWS };
}