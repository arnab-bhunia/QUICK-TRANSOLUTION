import { useCallback, useEffect, useMemo, useState } from "react";
import { downloadAnalyticsExplorerAdmin, getAnalyticsExplorerAdmin, getAnalyticsOverviewAdmin, getAnalyticsReportAdmin } from "../../api/client";
import { useAlert } from "../../context/AlertContext";
import "./AnalyticsPanel.css";

const PERIODS = [
  ["today", "Today"], ["yesterday", "Yesterday"], ["7d", "Last 7 days"],
  ["30d", "Last 30 days"], ["90d", "Last 90 days"], ["this_month", "This month"],
  ["previous_month", "Previous month"], ["this_quarter", "This quarter"], ["this_year", "This year"],
];
const VIEWS = [
  ["overview", "Business overview"], ["trends", "Business trends"], ["shipments", "Shipments & logistics"],
  ["bookings", "Booking requests"], ["enquiries", "Service enquiries"], ["workforce", "Team & offices"],
  ["recruitment", "Recruitment"], ["content", "Content performance"], ["explorer", "Data explorer"], ["audit", "Audit"],
];
const EXPLORER_ENTITIES = [
  ["shipments", "Shipments"], ["bookings", "Booking requests"], ["enquiries", "Service enquiries"],
  ["applications", "Job applications"], ["jobs", "Jobs"], ["content", "Content"], ["offices", "Offices"], ["team", "Team"],
];
const EXPLORER_STATUSES = {
  shipments: [["booked", "Booked"], ["picked_up", "Picked up"], ["in_transit", "In transit"], ["out_for_delivery", "Out for delivery"], ["delivered", "Delivered"], ["on_hold", "On hold"]],
  bookings: [["pending", "Pending"], ["contacted", "Contacted"], ["converted", "Converted"], ["rejected", "Rejected"]],
  enquiries: [["new", "New"], ["contacted", "Contacted"], ["closed", "Closed"]],
  applications: [["NEW", "New"], ["REVIEWING", "Reviewing"], ["SHORTLISTED", "Shortlisted"], ["INTERVIEW", "Interview"], ["SELECTED", "Selected"], ["REJECTED", "Rejected"], ["WITHDRAWN", "Withdrawn"]],
  jobs: [["DRAFT", "Draft"], ["OPEN", "Open"], ["CLOSED", "Closed"], ["ARCHIVED", "Archived"]],
  content: [["draft", "Draft"], ["scheduled", "Scheduled"], ["published", "Published"]],
  offices: [["true", "Active"], ["false", "Inactive"]],
  team: [["hr", "HR"], ["manager", "Manager"], ["staff", "Staff"], ["content_writer", "Content writer"]],
};
const STATUS_LABELS = {
  booked: "Booked", picked_up: "Picked up", in_transit: "In transit", out_for_delivery: "Out for delivery", delivered: "Delivered", on_hold: "On hold",
  pending: "Pending", contacted: "Contacted", converted: "Converted", rejected: "Rejected", new: "New", closed: "Closed",
  NEW: "New", REVIEWING: "Reviewing", SHORTLISTED: "Shortlisted", INTERVIEW: "Interview", SELECTED: "Selected", REJECTED: "Rejected", WITHDRAWN: "Withdrawn",
  true: "Active", false: "Inactive", draft: "Draft", scheduled: "Scheduled", published: "Published",
};
const fmt = (value) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number(value || 0));
const titleCase = (value) => String(value || "Unknown").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

function TrendChart({ rows }) {
  const width = 720; const height = 250; const pad = { top: 18, right: 18, bottom: 38, left: 38 };
  const plotW = width - pad.left - pad.right; const plotH = height - pad.top - pad.bottom;
  const max = Math.max(1, ...rows.flatMap((row) => [row.shipments, row.bookings, row.enquiries]));
  const x = (index) => pad.left + (rows.length <= 1 ? plotW / 2 : index * plotW / (rows.length - 1));
  const y = (value) => pad.top + plotH - (value / max) * plotH;
  const series = [{ key: "shipments", label: "Shipments" }, { key: "bookings", label: "Bookings" }, { key: "enquiries", label: "Enquiries" }];
  const labelEvery = Math.max(1, Math.ceil(rows.length / 6));
  return (
    <div className="analytics-trend-wrap">
      <svg className="analytics-trend-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Daily shipment, booking and enquiry creation trend">
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => <g key={fraction}><line x1={pad.left} x2={width - pad.right} y1={pad.top + plotH * fraction} y2={pad.top + plotH * fraction} className="analytics-gridline" /><text x={pad.left - 9} y={pad.top + plotH * fraction + 4} textAnchor="end" className="analytics-axis-label">{Math.round(max * (1 - fraction))}</text></g>)}
        {series.map(({ key }) => <polyline key={key} points={rows.map((row, index) => `${x(index)},${y(row[key])}`).join(" ")} className={`analytics-line analytics-line-${key}`} />)}
        {series.map(({ key }) => rows.map((row, index) => <circle key={`${key}-${row.date}`} cx={x(index)} cy={y(row[key])} r="2.7" className={`analytics-dot analytics-dot-${key}`} />))}
        {rows.map((row, index) => index % labelEvery === 0 || index === rows.length - 1 ? <text key={row.date} x={x(index)} y={height - 12} textAnchor="middle" className="analytics-axis-label">{row.date.slice(5).replace("-", "/")}</text> : null)}
      </svg>
      <div className="analytics-legend">{series.map((item) => <span key={item.key}><i className={`analytics-legend-dot analytics-dot-${item.key}`} />{item.label}</span>)}</div>
    </div>
  );
}

function Distribution({ title, data, emptyText = "No records to display for this category yet." }) {
  const entries = Object.entries(data || {}).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, count]) => count));
  return <section className="analytics-card analytics-distribution-card">
    <div className="analytics-card-heading"><div><h3>{title}</h3><p>Current record distribution</p></div><span className="analytics-card-mark">▥</span></div>
    {entries.length ? <div className="analytics-distribution-list">{entries.map(([key, count], index) => <div className="analytics-distribution-item" key={key}>
      <div className="analytics-distribution-label"><span>{STATUS_LABELS[key] || titleCase(key)}</span><strong>{fmt(count)}</strong></div>
      <div className="analytics-bar-track"><span style={{ width: `${Math.max(count > 0 ? 2 : 0, (count / max) * 100)}%` }} className={`analytics-bar-fill analytics-bar-${index % 5}`} /></div>
    </div>)}</div> : <p className="analytics-empty">{emptyText}</p>}
  </section>;
}

function KpiCard({ label, metric, icon, caption }) {
  const total = metric?.total ?? 0;
  const current = metric?.period;
  const previous = metric?.previousPeriod;
  const hasComparison = Number.isFinite(current) && Number.isFinite(previous);
  const change = hasComparison ? current - previous : 0;
  const percent = hasComparison && previous > 0 ? Math.round((change / previous) * 100) : null;
  return <article className="analytics-kpi-card">
    <div className="analytics-kpi-top"><span className="analytics-kpi-icon">{icon}</span><span className="analytics-kpi-label">{label}</span></div>
    <strong className="analytics-kpi-value">{fmt(total)}</strong>
    <div className="analytics-kpi-foot">{hasComparison ? <span className={`analytics-change ${change > 0 ? "is-up" : change < 0 ? "is-down" : "is-flat"}`}>{change > 0 ? "↑" : change < 0 ? "↓" : "—"} {percent === null ? `${change > 0 ? "+" : ""}${fmt(change)} vs prior period` : `${Math.abs(percent)}% vs prior period`}</span> : <span>{caption || "All-time total"}</span>}{Number.isFinite(current) && <span className="analytics-kpi-period">{fmt(current)} in period</span>}</div>
  </article>;
}

function SingleTrendChart({ rows = [] }) {
  const width = 720; const height = 230; const pad = { top: 16, right: 18, bottom: 36, left: 42 };
  const plotW = width - pad.left - pad.right; const plotH = height - pad.top - pad.bottom;
  const max = Math.max(1, ...rows.map((row) => Number(row.count || 0)));
  const x = (index) => pad.left + (rows.length <= 1 ? plotW / 2 : index * plotW / (rows.length - 1));
  const y = (value) => pad.top + plotH - (Number(value || 0) / max) * plotH;
  const labelEvery = Math.max(1, Math.ceil(rows.length / 6));
  return <div className="analytics-trend-wrap"><svg className="analytics-trend-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Daily record creation trend">
    {[0, .25, .5, .75, 1].map((fraction) => <g key={fraction}><line x1={pad.left} x2={width - pad.right} y1={pad.top + plotH * fraction} y2={pad.top + plotH * fraction} className="analytics-gridline" /><text x={pad.left - 9} y={pad.top + plotH * fraction + 4} textAnchor="end" className="analytics-axis-label">{Math.round(max * (1 - fraction))}</text></g>)}
    {rows.length > 1 && <polyline points={rows.map((row, index) => `${x(index)},${y(row.count)}`).join(" ")} className="analytics-line analytics-line-shipments" />}
    {rows.map((row, index) => <circle key={row.date || index} cx={x(index)} cy={y(row.count)} r="3" className="analytics-dot analytics-dot-shipments" />)}
    {rows.map((row, index) => index % labelEvery === 0 || index === rows.length - 1 ? <text key={row.date || index} x={x(index)} y={height - 11} textAnchor="middle" className="analytics-axis-label">{String(row.date || "").slice(5).replace("-", "/")}</text> : null)}
  </svg><div className="analytics-legend"><span><i className="analytics-legend-dot analytics-dot-shipments" />New records</span></div></div>;
}

function RankedBreakdown({ title, rows = [], description = "Ranked by record count" }) {
  const max = Math.max(1, ...rows.map((row) => Number(row.count || 0)));
  return <section className="analytics-card analytics-distribution-card"><div className="analytics-card-heading"><div><h3>{title}</h3><p>{description}</p></div><span className="analytics-card-mark">▥</span></div>
    {rows.length ? <div className="analytics-distribution-list">{rows.map((row, index) => <div className="analytics-distribution-item" key={`${row.label || row.officeCode || row._id || "item"}-${index}`}><div className="analytics-distribution-label"><span>{row.label || row.officeCode || row._id || "Unknown"}</span><strong>{fmt(row.count)}</strong></div><div className="analytics-bar-track"><span style={{ width: `${Math.max(row.count > 0 ? 2 : 0, (Number(row.count || 0) / max) * 100)}%` }} className={`analytics-bar-fill analytics-bar-${index % 5}`} /></div></div>)}</div> : <p className="analytics-empty">No records to display for this category yet.</p>}
  </section>;
}

function ReportKpis({ report, view }) {
  const metric = (total, periodValue, previousPeriod) => ({ total, period: periodValue, previousPeriod });
  const metrics = {
    shipments: [["All shipments", metric(report.kpis?.total, report.kpis?.inPeriod, report.kpis?.previousPeriod), "↗", "All recorded shipments"], ["Created in period", metric(report.kpis?.inPeriod, report.kpis?.inPeriod, report.kpis?.previousPeriod), "+", "New shipments"]],
    bookings: [["All requests", metric(report.kpis?.total, report.kpis?.inPeriod, report.kpis?.previousPeriod), "▤", "All booking requests"], ["Created in period", metric(report.kpis?.inPeriod, report.kpis?.inPeriod, report.kpis?.previousPeriod), "+", "New requests"]],
    enquiries: [["All enquiries", metric(report.kpis?.total, report.kpis?.inPeriod, report.kpis?.previousPeriod), "✉", "All service enquiries"], ["Received in period", metric(report.kpis?.inPeriod, report.kpis?.inPeriod, report.kpis?.previousPeriod), "+", "New enquiries"], ["Assigned enquiries", metric(report.kpis?.assigned), "↗", "Currently assigned"]],
    workforce: [["Team members", metric(report.kpis?.total, report.kpis?.createdInPeriod), "♙", "Non-admin staff accounts"], ["Created in period", metric(report.kpis?.createdInPeriod), "+", "New accounts"], ["Active offices", metric(report.kpis?.activeOfficeCount), "✓", `${fmt(report.kpis?.officeCount)} total offices`]],
    recruitment: [["Applications", metric(report.kpis?.applications, report.kpis?.applicationsInPeriod, report.kpis?.previousPeriod), "♙", "All recorded applications"], ["Received in period", metric(report.kpis?.applicationsInPeriod, report.kpis?.applicationsInPeriod, report.kpis?.previousPeriod), "+", "New applications"], ["Open jobs", metric(report.kpis?.openJobs), "▣", `${fmt(report.kpis?.jobsTotal)} total jobs`]],
    content: [["Content items", metric(report.kpis?.total, report.kpis?.createdInPeriod, report.kpis?.previousPeriod), "▤", "All content records"], ["Created in period", metric(report.kpis?.createdInPeriod, report.kpis?.createdInPeriod, report.kpis?.previousPeriod), "+", "New content records"], ["Published in period", metric(report.kpis?.publishedInPeriod), "✓", `${fmt(report.kpis?.scheduledCount)} currently scheduled`]],
  };
  return <div className={`analytics-kpi-grid analytics-kpi-count-${(metrics[view] || []).length}`}>{(metrics[view] || []).map(([label, value, icon, caption]) => <KpiCard key={label} label={label} metric={value} icon={icon} caption={caption} />)}</div>;
}

function DedicatedReport({ view, report, loading, error, onRetry }) {
  if (loading && !report) return <div className="analytics-report-loading"><div className="analytics-skeleton-kpis">{[1, 2, 3].map((n) => <div key={n} className="analytics-skeleton-card" />)}</div><div className="analytics-skeleton-chart" /></div>;
  if (error && !report) return <div className="analytics-error"><strong>Report unavailable.</strong><span>{error}</span><button type="button" onClick={onRetry}>Try again</button></div>;
  if (!report) return null;
  const distributionMap = {
    shipments: [["Current shipment status", report.distributions?.statuses]],
    bookings: [["Current booking status", report.distributions?.statuses]],
    enquiries: [["Current enquiry status", report.distributions?.statuses]],
    workforce: [["Team by role", report.distributions?.roles], ["Office status", report.distributions?.offices]],
    recruitment: [["Application status", report.distributions?.applicationStatuses], ["Job status", report.distributions?.jobStatuses]],
    content: [["Publication status", report.distributions?.statuses], ["Content type", report.distributions?.types]],
  };
  const breakdowns = {
    shipments: [["Top shipment routes", report.breakdowns?.topRoutes, "All-time shipment count"], ["Current shipment locations", report.breakdowns?.currentLocations, "Current location of recorded shipments"]],
    bookings: [["Popular booking routes", report.breakdowns?.topRoutes, "All-time booking request count"]],
    enquiries: [["Enquiries by service", report.breakdowns?.byService, "Ranked by all recorded enquiries"]],
    workforce: [["Team by office", report.breakdowns?.staffByOffice, "Current employee assignment by office"]],
    recruitment: [["Applications by job", report.breakdowns?.applicationsByJob, "Grouped by job title snapshot"]],
    content: [["Content by category", report.breakdowns?.categories, "Ranked by content record count"]],
  };
  return <div className="analytics-dedicated-report">
    {error && <div className="analytics-error"><strong>Showing the last successful report.</strong><span>{error}</span><button type="button" onClick={onRetry}>Retry</button></div>}
    <div className="analytics-dedicated-heading"><span>{report.meta?.label || "Selected period"}</span>{loading && <span className="analytics-report-updating">Updating report…</span>}</div>
    <ReportKpis report={report} view={view} />
    <section className="analytics-card analytics-trend-card"><div className="analytics-card-heading"><div><h3>Creation trend</h3><p>New records by creation date · not a status-transition timeline</p></div><span className="analytics-chart-period">{report.meta?.timeZone || "Asia/Kolkata"}</span></div>{report.trend?.length ? <SingleTrendChart rows={report.trend} /> : <p className="analytics-empty">No activity found for this period.</p>}</section>
    <div className="analytics-report-grid">{(distributionMap[view] || []).map(([title, values]) => <Distribution key={title} title={title} data={values} />)}{(breakdowns[view] || []).map(([title, rows, description]) => <RankedBreakdown key={title} title={title} rows={rows} description={description} />)}</div>
    {report.notes?.length > 0 && <aside className="analytics-report-notes"><strong>Metric notes</strong><ul>{report.notes.map((note) => <li key={note}>{note}</li>)}</ul></aside>}
  </div>;
}

function ReportIntro({ view }) {
  const info = {
    overview: ["Business overview", "A decision-ready snapshot of activity across your operations."],
    trends: ["Business trends", "Compare daily record creation across the selected reporting window."],
    shipments: ["Shipments & logistics", "Understand shipment volume, current status mix and the most-used routes."],
    bookings: ["Booking requests", "Track booking demand and the current request pipeline."],
    enquiries: ["Service enquiries", "Monitor incoming service enquiries and their current handling status."],
    workforce: ["Team & offices", "View the current workforce and office footprint without exposing employee personal data."],
    recruitment: ["Recruitment", "Review job applications and the current recruitment pipeline."],
    content: ["Content performance", "Review content inventory and publication status. Page views and engagement are not tracked yet."],
    explorer: ["Data explorer", "Explore controlled operational records and export filtered CSV or Excel files with sensitive fields excluded."],
    audit: ["Audit log", "Recent recorded administrative activity. Coverage depends on which operations currently emit audit events."],
  };
  return <div className="analytics-report-intro"><div><div className="analytics-eyebrow">OPERATIONS INTELLIGENCE</div><h2>{info[view]?.[0] || info.overview[0]}</h2><p>{info[view]?.[1] || info.overview[1]}</p></div><span className="analytics-live-indicator"><i /> Live database snapshot</span></div>;
}

export default function AnalyticsPanel({ view = "overview" }) {
  const alert = useAlert();
  const [period, setPeriod] = useState("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [explorerEntity, setExplorerEntity] = useState("shipments");
  const [explorerSearch, setExplorerSearch] = useState("");
  const [explorerStatus, setExplorerStatus] = useState("");
  const [explorerPage, setExplorerPage] = useState(1);
  const [reportData, setReportData] = useState({});
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [explorerData, setExplorerData] = useState(null);
  const [explorerLoading, setExplorerLoading] = useState(false);
  const [explorerError, setExplorerError] = useState("");
  const [exportingFormat, setExportingFormat] = useState("");
  const [exportError, setExportError] = useState("");

  const load = useCallback(async ({ quiet = false } = {}) => {
    if (quiet) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const params = period === "custom" ? { period, start: customStart, end: customEnd } : { period };
      const result = await getAnalyticsOverviewAdmin(params);
      setData(result);
    } catch (err) {
      setError(err?.message || "Analytics could not be loaded.");
      if (!quiet) alert.error(err?.message || "Could not load analytics.");
    } finally { setLoading(false); setRefreshing(false); }
  // AlertContext currently returns a fresh wrapper object per render; omit it
  // from dependencies so loading state changes do not retrigger this request.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, customStart, customEnd]);

  useEffect(() => { if (period !== "custom" || (customStart && customEnd)) load(); }, [load, period, customStart, customEnd]);

  const reportKey = ({ shipments: "shipments", bookings: "bookings", enquiries: "enquiries", workforce: "workforce", recruitment: "recruitment", content: "content" })[view];
  const loadReport = useCallback(async () => {
    if (!reportKey || (period === "custom" && (!customStart || !customEnd))) return;
    setReportLoading(true);
    setReportError("");
    try {
      const params = period === "custom" ? { period, start: customStart, end: customEnd } : { period };
      const result = await getAnalyticsReportAdmin(reportKey, params);
      setReportData((current) => ({ ...current, [reportKey]: result }));
    } catch (err) {
      setReportError(err?.message || "Could not load this report.");
    } finally { setReportLoading(false); }
  }, [reportKey, period, customStart, customEnd]);

  useEffect(() => { loadReport(); }, [loadReport]);

  useEffect(() => {
    if (view !== "explorer" || (period === "custom" && (!customStart || !customEnd))) return undefined;
    let cancelled = false;
    setExplorerLoading(true);
    setExplorerError("");
    const timer = window.setTimeout(() => {
      const params = {
        entity: explorerEntity, page: explorerPage, pageSize: 25, search: explorerSearch,
        status: explorerStatus, period,
        ...(period === "custom" ? { start: customStart, end: customEnd } : {}),
      };
      getAnalyticsExplorerAdmin(params).then((result) => {
        if (!cancelled) setExplorerData(result);
      }).catch((err) => {
        if (!cancelled) setExplorerError(err?.message || "Could not load the data explorer.");
      }).finally(() => { if (!cancelled) setExplorerLoading(false); });
    }, explorerSearch ? 250 : 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [view, period, customStart, customEnd, explorerEntity, explorerSearch, explorerStatus, explorerPage]);

  const activeView = VIEWS.some(([key]) => key === view) ? view : "overview";
  const exportExplorer = async (format) => {
    setExportingFormat(format);
    setExportError("");
    try {
      const params = {
        entity: explorerEntity, search: explorerSearch, status: explorerStatus, format,
        ...(period === "custom" ? { period, start: customStart, end: customEnd } : { period }),
      };
      const blob = await downloadAnalyticsExplorerAdmin(params);
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `quick-transolution-${explorerEntity}-${period}-${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (err) {
      setExportError(err?.message || "Export could not be generated.");
    } finally {
      setExportingFormat("");
    }
  };
  const kpis = data?.kpis;
  const shownKpis = useMemo(() => {
    if (activeView === "shipments") return [["Total shipments", kpis?.shipments, "↗", "Tracked consignments"], ["Created in period", { total: kpis?.shipments?.period, period: kpis?.shipments?.period }, "＋", "New shipments"]];
    if (activeView === "bookings") return [["Booking requests", kpis?.bookings, "▤", "Demand pipeline"], ["Created in period", { total: kpis?.bookings?.period, period: kpis?.bookings?.period }, "＋", "New requests"]];
    if (activeView === "enquiries") return [["Service enquiries", kpis?.enquiries, "✉", "Incoming enquiries"], ["Received in period", { total: kpis?.enquiries?.period, period: kpis?.enquiries?.period }, "＋", "New enquiries"]];
    if (activeView === "recruitment") return [["Applications", kpis?.applications, "♙", "All applications"], ["Received in period", { total: kpis?.applications?.period, period: kpis?.applications?.period }, "＋", "New applications"], ["Open jobs", { total: kpis?.jobs?.active }, "▣", "Currently open"]];
    if (activeView === "content") return [["Content items", { total: kpis?.content?.total }, "▤", "Total content"], ["Published", { total: kpis?.content?.published }, "✓", "Published content"]];
    if (activeView === "workforce") return [["Team members", { total: kpis?.workforce?.total }, "♙", "Staff accounts"], ["Total offices", { total: kpis?.workforce?.offices }, "⌖", "All offices"], ["Active offices", { total: kpis?.workforce?.activeOffices }, "✓", "Currently active"]];
    return [["Shipments", kpis?.shipments, "↗", "Shipment volume"], ["Booking requests", kpis?.bookings, "▤", "Business demand"], ["Service enquiries", kpis?.enquiries, "✉", "Service interest"], ["Job applications", kpis?.applications, "♙", "Recruitment activity"]];
  }, [activeView, kpis]);

  const dedicatedReportViews = ["shipments", "bookings", "enquiries", "workforce", "recruitment", "content"];
  const dedicatedReport = reportData[reportKey];

  if (loading && !data && !dedicatedReportViews.includes(activeView)) return <div className="analytics-panel"><div className="analytics-skeleton-heading" /><div className="analytics-skeleton-kpis">{[1, 2, 3, 4].map((n) => <div key={n} className="analytics-skeleton-card" />)}</div><div className="analytics-skeleton-chart" /></div>;

  return <div className="analytics-panel">
    <div className="analytics-toolbar"><div className="analytics-period-control"><label htmlFor="analytics-period">Reporting period</label><select id="analytics-period" value={period} onChange={(event) => setPeriod(event.target.value)}>{PERIODS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}<option value="custom">Custom range</option></select></div>
      {period === "custom" && <div className="analytics-custom-dates"><label>From <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} /></label><label>To <input type="date" value={customEnd} min={customStart || undefined} onChange={(e) => setCustomEnd(e.target.value)} /></label></div>}
      <div className="analytics-toolbar-actions"><span className="analytics-timezone">Timezone: Asia/Kolkata</span><button type="button" className="analytics-refresh-button" onClick={() => { load({ quiet: true }); if (reportKey) loadReport(); }} disabled={refreshing || reportLoading || (period === "custom" && (!customStart || !customEnd))}>{refreshing || reportLoading ? "Refreshing…" : "↻ Refresh"}</button></div>
    </div>
    <ReportIntro view={activeView} />
    {error && <div className="analytics-error"><strong>Could not refresh analytics.</strong><span>{error}</span><button type="button" onClick={() => load()}>Try again</button></div>}
    {data && <>
      {!dedicatedReportViews.includes(activeView) && <div className={`analytics-kpi-grid analytics-kpi-count-${shownKpis.length}`}>{shownKpis.map(([label, metric, icon, caption]) => <KpiCard key={label} label={label} metric={metric} icon={icon} caption={caption} />)}</div>}
      {dedicatedReportViews.includes(activeView) && <DedicatedReport view={activeView} report={dedicatedReport} loading={reportLoading} error={reportError} onRetry={loadReport} />}
      {!dedicatedReportViews.includes(activeView) && (activeView === "overview" || activeView === "trends" || activeView === "explorer") && <section className="analytics-card analytics-trend-card"><div className="analytics-card-heading"><div><h3>Activity over time</h3><p>New records by creation date · missing days are shown as zero</p></div><span className="analytics-chart-period">{data.meta?.label || period}</span></div>{data.trend?.length ? <TrendChart rows={data.trend} /> : <p className="analytics-empty">No activity found for this period.</p>}</section>}
      {!dedicatedReportViews.includes(activeView) && <div className="analytics-report-grid">
        {(activeView === "overview" || activeView === "shipments" || activeView === "explorer") && <Distribution title="Shipment status" data={data.distributions?.shipmentsByStatus} />}
        {(activeView === "overview" || activeView === "bookings") && <Distribution title="Booking request status" data={data.distributions?.bookingsByStatus} />}
        {(activeView === "overview" || activeView === "enquiries") && <Distribution title="Service enquiry status" data={data.distributions?.enquiriesByStatus} />}
        {activeView === "recruitment" && <Distribution title="Application status" data={data.distributions?.applicationsByStatus} />}
        {activeView === "workforce" && <><Distribution title="Team by role" data={data.distributions?.staffByRole} /><Distribution title="Office status" data={data.distributions?.officesByStatus} /></>}
        {activeView === "content" && <Distribution title="Content publication status" data={data.distributions?.blogsByStatus} />}
        {(activeView === "overview" || activeView === "shipments" || activeView === "explorer") && <section className="analytics-card analytics-routes-card"><div className="analytics-card-heading"><div><h3>Top shipment routes</h3><p>Ranked by all-time shipment count</p></div><span className="analytics-card-mark">↗</span></div>{data.topRoutes?.length ? <div className="analytics-routes-list">{data.topRoutes.map((route, index) => <div className="analytics-route-row" key={`${route.route}-${index}`}><span className="analytics-route-rank">{String(index + 1).padStart(2, "0")}</span><span className="analytics-route-name">{route.route}</span><strong>{fmt(route.count)}</strong></div>)}</div> : <p className="analytics-empty">No route data available yet.</p>}</section>}
      </div>}
      {activeView === "audit" && <section className="analytics-card analytics-audit-card"><div className="analytics-card-heading"><div><h3>Recent recorded activity</h3><p>Latest events present in the audit log; this is not yet a complete history of every system action.</p></div><span className="analytics-card-mark">◷</span></div>{data.recentActivity?.length ? <div className="analytics-audit-list">{data.recentActivity.map((entry, index) => <div className="analytics-audit-row" key={`${entry.action}-${entry.createdAt}-${index}`}><span className="analytics-audit-symbol">{entry.trackingId ? "↗" : "•"}</span><div className="analytics-audit-main"><strong>{titleCase(entry.action)}</strong><span>{entry.entity}{entry.trackingId ? ` · ${entry.trackingId}` : ""}</span></div><div className="analytics-audit-meta"><span>{entry.performedBy?.name || "System / public action"}</span><time dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</time></div></div>)}</div> : <p className="analytics-empty">No recorded activity found.</p>}</section>}
      {activeView === "explorer" && <section className="analytics-card analytics-explorer-card">
        <div className="analytics-card-heading analytics-explorer-heading"><div><h3>Operational data explorer</h3><p>Search and page through a controlled set of non-sensitive fields. Exports use the same filters and reporting period.</p></div><div className="analytics-export-actions"><button type="button" onClick={() => exportExplorer("csv")} disabled={Boolean(exportingFormat) || (period === "custom" && (!customStart || !customEnd))}>{exportingFormat === "csv" ? "Preparing CSV…" : "Export CSV"}</button><button type="button" onClick={() => exportExplorer("xlsx")} disabled={Boolean(exportingFormat) || (period === "custom" && (!customStart || !customEnd))}>{exportingFormat === "xlsx" ? "Preparing Excel…" : "Export Excel"}</button></div></div>
        <div className="analytics-explorer-filters">
          <label>Dataset<select value={explorerEntity} onChange={(event) => { setExplorerEntity(event.target.value); setExplorerStatus(""); setExplorerPage(1); }} >{EXPLORER_ENTITIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Search<input type="search" value={explorerSearch} onChange={(event) => { setExplorerSearch(event.target.value); setExplorerPage(1); }} placeholder="Search visible fields…" maxLength={100} /></label>
          <label>Status<select value={explorerStatus} onChange={(event) => { setExplorerStatus(event.target.value); setExplorerPage(1); }}><option value="">All statuses</option>{(EXPLORER_STATUSES[explorerEntity] || []).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        </div>
        {explorerError && <div className="analytics-error"><strong>Explorer unavailable.</strong><span>{explorerError}</span></div>}
        {exportError && <div className="analytics-error"><strong>Export unavailable.</strong><span>{exportError}</span><button type="button" onClick={() => setExportError("")}>Dismiss</button></div>}
        <div className="analytics-explorer-summary">{explorerLoading ? "Loading records…" : `${fmt(explorerData?.total || 0)} records found`}</div>
        <div className="analytics-table-wrap"><table className="analytics-data-table"><thead><tr>{(explorerData?.columns || []).map((column) => <th key={column}>{titleCase(column)}</th>)}</tr></thead><tbody>
          {explorerData?.rows?.map((row, rowIndex) => <tr key={row._id || rowIndex}>{(explorerData.columns || []).map((column) => { const value = row[column]; const isDate = value && typeof value === "string" && /At$|Date$/.test(column) && !Number.isNaN(Date.parse(value)); return <td key={column}>{value === null || value === undefined || value === "" ? <span className="analytics-cell-empty">—</span> : typeof value === "boolean" ? (value ? "Active" : "Inactive") : isDate ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium" }) : column.toLowerCase().includes("status") ? (STATUS_LABELS[value] || titleCase(value)) : String(value)}</td>; })}</tr>)}
          {!explorerLoading && !explorerData?.rows?.length && <tr><td className="analytics-table-empty" colSpan={explorerData?.columns?.length || 1}>No records match these filters.</td></tr>}
        </tbody></table></div>
        <div className="analytics-pagination"><span>Page {explorerData?.page || 1} of {explorerData?.totalPages || 1}</span><div><button type="button" disabled={explorerLoading || explorerPage <= 1} onClick={() => setExplorerPage((page) => Math.max(1, page - 1))}>Previous</button><button type="button" disabled={explorerLoading || explorerPage >= (explorerData?.totalPages || 1)} onClick={() => setExplorerPage((page) => page + 1)}>Next</button></div></div>
        <p className="analytics-explorer-safety">Sensitive contact details, resume data, IP addresses and internal notes are excluded from this explorer and its exports. Exports are limited to 5,000 matching records; narrow your filters if the limit is exceeded. Export activity is recorded in the audit log.</p>
      </section>}
      <div className="analytics-footnote">Metrics distinguish all-time/current-state totals from records created in the selected period. Status distributions reflect the current status, not a historical status transition. No personal contact details are included.</div>
    </>}
    {!data && dedicatedReportViews.includes(activeView) && <DedicatedReport view={activeView} report={dedicatedReport} loading={reportLoading} error={reportError} onRetry={loadReport} />}
  </div>;
}
