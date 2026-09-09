import { useEffect, useState } from "react";
import { listServiceEnquiriesAdmin, getServiceEnquiryCountsAdmin } from "../../../api/client";
import { useAlert } from "../../../context/AlertContext";
import { site } from "../../../config/site";
import EnquiryDetailDrawer from "./EnquiryDetailDrawer";
import "./ServiceEnquiriesPanel.css";

const STATUSES = ["new", "contacted", "closed"];
const STATUS_LABELS = { new: "New", contacted: "Contacted", closed: "Closed" };

// Same permission-check shape used throughout the admin panel
// (AdminDashboard.jsx has its own copy for the exact same reason —
// it's a 2-line pure function, not worth a shared import for).
function hasPerm(permissions, needed) {
  if (!permissions) return false;
  return permissions.includes("*") || permissions.includes(needed);
}

export default function ServiceEnquiriesPanel({ permissions }) {
  const alert = useAlert();
  const canContact = hasPerm(permissions, "service_enquiries:contact");
  const canEmail = hasPerm(permissions, "service_enquiries:email");

  const [service, setService] = useState("all");
  const [status, setStatus] = useState("all");
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState({ items: [], page: 1, totalPages: 1, total: 0 });
  const [loaded, setLoaded] = useState(false);
  const [counts, setCounts] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const loadCounts = () => {
    getServiceEnquiryCountsAdmin()
      .then(setCounts)
      .catch(() => {}); // non-critical — tabs just render without counts
  };

  const load = () => {
    setLoaded(false);
    const params = { page, limit: 20 };
    if (service !== "all") params.service = service;
    if (status !== "all") params.status = status;
    if (q) params.q = q;
    // Date inputs give date-only values ("YYYY-MM-DD"); pin them to the
    // start/end of that day so "to" includes the whole selected day
    // rather than being read as midnight of it.
    if (fromDate) params.from = `${fromDate}T00:00:00.000`;
    if (toDate) params.to = `${toDate}T23:59:59.999`;

    listServiceEnquiriesAdmin(params)
      .then(setData)
      .catch((err) => alert.error(err.message || "Could not load enquiries."))
      .finally(() => setLoaded(true));
  };

  useEffect(loadCounts, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(load, [service, status, q, fromDate, toDate, page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce the search box into `q` rather than firing a request on
  // every keystroke — the backend has to decrypt-and-scan for anything
  // that isn't an exact email match, so this matters more here than on
  // a typical search box.
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setQ(qInput.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [qInput]);

  const selectService = (id) => {
    setService(id);
    setPage(1);
  };

  const refreshAfterAction = () => {
    load();
    loadCounts();
  };

  return (
    <div className="service-enquiries-panel">
      <div className="admin-panel-head">
        <h2>Service Enquiries</h2>
      </div>

      <div className="se-service-tabs">
        <button
          type="button"
          className={`se-service-tab ${service === "all" ? "is-active" : ""}`}
          onClick={() => selectService("all")}
        >
          All
          {counts && <span className="se-tab-count">{counts.overall.total}</span>}
          {counts && counts.overall.new > 0 && (
            <span className="se-tab-new">{counts.overall.new} new</span>
          )}
        </button>
        {site.services.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`se-service-tab ${service === s.id ? "is-active" : ""}`}
            onClick={() => selectService(s.id)}
          >
            {s.title}
            {counts?.byService?.[s.id] && (
              <span className="se-tab-count">{counts.byService[s.id].total}</span>
            )}
            {counts?.byService?.[s.id]?.new > 0 && (
              <span className="se-tab-new">{counts.byService[s.id].new} new</span>
            )}
          </button>
        ))}
      </div>

      <div className="admin-card se-filters">
        <div className="se-search-group">
          <input
            type="search"
            placeholder="Search by name, phone, or exact email…"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            className="se-search-input"
            aria-label="Search enquiries by name, phone, or exact email"
          />
          <span className="se-search-hint">
            Matches a full email address exactly, or partial name/phone
          </span>
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <div className="se-date-range">
          <label className="se-date-field">
            <span>From</span>
            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              aria-label="From date"
            />
          </label>
          <label className="se-date-field">
            <span>To</span>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              aria-label="To date"
            />
          </label>
          {(fromDate || toDate) && (
            <button
              type="button"
              className="admin-btn admin-btn-ghost se-clear-dates"
              onClick={() => {
                setFromDate("");
                setToDate("");
                setPage(1);
              }}
            >
              Clear dates
            </button>
          )}
        </div>
      </div>

      <div className="admin-card">
        {!loaded && <p className="admin-empty">Loading...</p>}
        {loaded && data.items.length === 0 && (
          <p className="admin-empty">No enquiries match these filters.</p>
        )}
        {data.items.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Received</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Service</th>
                  <th>Requirement</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr
                    key={item.id}
                    className="admin-row-clickable"
                    onClick={() => setSelectedId(item.id)}
                  >
                    <td>{new Date(item.requestedAt).toLocaleDateString()}</td>
                    <td>{item.name}</td>
                    <td>
                      <div className="se-contact-cell">
                        <span>{item.email}</span>
                        <span className="se-phone-masked">{item.phoneMasked}</span>
                      </div>
                    </td>
                    <td>{item.serviceTitle}</td>
                    <td className="se-message-preview">{item.messagePreview}</td>
                    <td>
                      <span className={`admin-badge admin-badge-${item.status}`}>
                        {STATUS_LABELS[item.status] || item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data.totalPages > 1 && (
          <div className="se-pagination">
            <button
              type="button"
              className="admin-btn admin-btn-ghost"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </button>
            <span className="se-pagination-label">
              Page {data.page} of {data.totalPages}
            </span>
            <button
              type="button"
              className="admin-btn admin-btn-ghost"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, data.totalPages))}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {selectedId && (
        <EnquiryDetailDrawer
          id={selectedId}
          canContact={canContact}
          canEmail={canEmail}
          onClose={() => setSelectedId(null)}
          onUpdated={refreshAfterAction}
        />
      )}
    </div>
  );
}
