import { resolveAnalyticsRange } from "../utils/analytics/dateRange.js";
import { getAnalyticsOverview } from "../services/analytics/overviewService.js";
import { getAnalyticsExplorer } from "../services/analytics/explorerService.js";
import { getAnalyticsReport } from "../services/analytics/reportService.js";
import { exportAnalyticsExplorer, escapeCsvCell } from "../services/analytics/explorerService.js";
import AuditLog from "../models/AuditLog.js";
import ExcelJS from "exceljs";

export async function analyticsOverview(req, res) {
  const range = resolveAnalyticsRange(req.query);
  const data = await getAnalyticsOverview(range);
  res.json(data);
}

export async function analyticsExplorer(req, res) {
  const range = resolveAnalyticsRange(req.query);
  const data = await getAnalyticsExplorer(req.query, range);
  res.json(data);
}

export async function analyticsReport(req, res) {
  const range = resolveAnalyticsRange(req.query);
  const data = await getAnalyticsReport(req.params.report, range);
  res.json(data);
}


export async function analyticsExplorerExport(req, res) {
  const format = String(req.query.format || "csv").toLowerCase();
  const range = resolveAnalyticsRange(req.query);
  const data = await exportAnalyticsExplorer(req.query, range, format);
  const safeEntity = data.entity.replace(/[^a-z0-9_-]/gi, "-");
  const dateStamp = new Date().toISOString().slice(0, 10);
  const filename = `quick-transolution-${safeEntity}-${range.period}-${dateStamp}`;

  // Record only metadata about the export. Never persist search terms, row data,
  // or other potentially sensitive user-entered filter values in the audit log.
  await AuditLog.create({
    action: "analytics_exported",
    performedBy: req.user?._id,
    ipAddress: req.ip,
    after: {
      dataset: data.entity,
      format,
      rowCount: data.rows.length,
      period: range.period,
      statusFilterApplied: Boolean(data.filters.status),
      searchFilterApplied: data.filters.searchApplied,
    },
  });

  if (format === "csv") {
    const lines = [data.columns.map(escapeCsvCell).join(",")];
    for (const row of data.rows) lines.push(data.columns.map((column) => escapeCsvCell(row[column])).join(","));
    const csv = `\uFEFF${lines.join("\r\n")}`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(csv);
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Quick Transolution Analytics";
  workbook.created = new Date();
  const worksheet = workbook.addWorksheet("Analytics export", { views: [{ state: "frozen", ySplit: 1 }] });
  worksheet.columns = data.columns.map((key) => ({ header: key, key, width: Math.min(32, Math.max(14, key.length + 3)) }));
  worksheet.addRows(data.rows);
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF123B52" } };
  worksheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: data.columns.length } };
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) row.eachCell((cell) => { cell.value = cell.value == null ? "" : String(cell.value); });
  });
  const buffer = await workbook.xlsx.writeBuffer();
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}.xlsx"`);
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).send(Buffer.from(buffer));
}
