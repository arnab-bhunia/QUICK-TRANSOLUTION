import { useEffect, useState } from "react";
import { listApplicationsAdmin, listJobOptionsAdmin, exportApplicationsAdmin } from "../../../api/client";
import { useAlert } from "../../../context/AlertContext";
import ApplicationDetailDrawer from "./ApplicationDetailDrawer";
import "../StaffPanel.css";
import "../BlogManagement.css";
import "./CareersPanel.css";

const STATUS_BADGE = {
  NEW: "admin-badge-new",
  REVIEWING: "admin-badge-contacted",
  SHORTLISTED: "admin-badge-picked_up",
  INTERVIEW: "admin-badge-on_hold",
  SELECTED: "admin-badge-converted",
  REJECTED: "admin-badge-rejected",
  WITHDRAWN: "admin-badge-closed",
};

const STATUS_OPTIONS = ["NEW", "REVIEWING", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED", "WITHDRAWN"];

export default function ApplicationsPanel() {
  const alert = useAlert();

  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [jobs, setJobs] = useState([]);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [jobFilter, setJobFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedId, setSelectedId] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    listJobOptionsAdmin()
      .then((res) => setJobs(res.items))
      .catch(() => {}); // non-critical — the filter dropdown just stays empty
  }, []);

  const currentFilters = () => {
    const params = {};
    if (jobFilter !== "all") params.job = jobFilter;
    if (statusFilter !== "all") params.status = statusFilter;
    if (from) params.from = from;
    if (to) params.to = to;
    if (search) params.q = search;
    return params;
  };

  const load = (targetPage = page) => {
    setLoaded(false);
    listApplicationsAdmin({ ...currentFilters(), page: targetPage })
      .then((res) => {
        setItems(res.items);
        setPage(res.page || targetPage);
        setTotalPages(res.totalPages || 1);
      })
      .catch((err) => alert.error(err.message || "Could not load applications."))
      .finally(() => setLoaded(true));
  };

  useEffect(() => load(1), [jobFilter, statusFilter, from, to, search]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    load(p);
  };

  const clearDates = () => {
    setFrom("");
    setTo("");
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportApplicationsAdmin(currentFilters());
    } catch (err) {
      alert.error(err.message || "Could not export applications.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="staff-panel">
      <div className="admin-panel-head">
        <h2>Applications</h2>
        <button className="admin-btn admin-btn-primary" onClick={handleExport} disabled={exporting}>
          {exporting ? "Exporting..." : "Export Applications"}
        </button>
      </div>

      <div className="admin-card careers-app-filters">
        <input
          placeholder="Search name or phone..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{ minWidth: 220, flex: 1 }}
        />
        <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
          <option value="all">All jobs</option>
          {jobs.map((j) => (
            <option key={j._id} value={j._id}>
              {j.title}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} title="From date" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} title="To date" />
        {(from || to) && (
          <button className="admin-btn" onClick={clearDates}>
            Clear dates
          </button>
        )}
      </div>

      <div className="admin-card">
        {!loaded && <p className="admin-empty">Loading...</p>}
        {loaded && items.length === 0 && <p className="admin-empty">No applications match these filters.</p>}
        {items.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Candidate</th>
                  <th>Job</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Source</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((app) => (
                  <tr key={app.id}>
                    <td>{app.applicationId}</td>
                    <td>
                      <div>{app.name}</div>
                      <div className="se-phone-masked">{app.email}</div>
                    </td>
                    <td>{app.jobTitle}</td>
                    <td>{app.experience || "—"}</td>
                    <td>
                      <span className={`admin-badge ${STATUS_BADGE[app.status] || ""}`}>{app.status}</span>
                    </td>
                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>{app.source}</td>
                    <td>
                      <button className="admin-btn" onClick={() => setSelectedId(app.id)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {loaded && totalPages > 1 && (
          <div className="blog-pagination-bar">
            <button className="admin-btn" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
              &larr; Previous
            </button>
            <span className="blog-pagination-status">
              Page {page} of {totalPages}
            </span>
            <button className="admin-btn" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
              Next &rarr;
            </button>
          </div>
        )}
      </div>

      {selectedId && (
        <ApplicationDetailDrawer
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onStatusChanged={() => load(page)}
        />
      )}
    </div>
  );
}
