import { useCallback, useEffect, useState } from "react";
import {
  listOfficesAdmin,
  createOfficeAdmin,
  updateOfficeAdmin,
  deactivateOfficeAdmin,
  reactivateOfficeAdmin,
} from "../../api/client";
import { useAlert } from "../../context/AlertContext";
import "./OfficesPanel.css";

const emptyForm = { name: "", address: "", city: "", state: "", country: "", phone: "", email: "" };

function locationOf(o) {
  return [o.city, o.state, o.country].filter(Boolean).join(", ") || "—";
}

export default function OfficesPanel() {
  const alert = useAlert();
  const [offices, setOffices] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // modal: null | { mode: "create" } | { mode: "edit", office } | { mode: "created", office }
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null); // office pending deactivation
  const [busyCode, setBusyCode] = useState(null);
  const [deactivateError, setDeactivateError] = useState("");

  const load = useCallback(() => {
    const params = {};
    if (q.trim()) params.q = q.trim();
    if (statusFilter !== "all") params.status = statusFilter;
    return listOfficesAdmin(params)
      .then(setOffices)
      .catch((err) => alert.error(err.message || "Could not load offices."))
      .finally(() => setLoaded(true));
  }, [q, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced so typing in the search box doesn't fire a request per key.
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const openCreate = () => {
    setForm(emptyForm);
    setModal({ mode: "create" });
  };

  const openEdit = (office) => {
    setForm({
      name: office.name,
      address: office.address,
      city: office.city,
      state: office.state,
      country: office.country,
      phone: office.phone,
      email: office.email,
    });
    setModal({ mode: "edit", office });
  };

  const closeModal = () => {
    if (!saving) setModal(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return; // blocks double submission
    setSaving(true);
    try {
      if (modal.mode === "create") {
        const created = await createOfficeAdmin(form);
        setModal({ mode: "created", office: created });
      } else {
        await updateOfficeAdmin(modal.office.code, form);
        alert.success("Office updated.");
        setModal(null);
      }
      await load();
    } catch (err) {
      alert.error(err.message || "Could not save the office.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDeactivate = async () => {
    const office = confirm;
    setBusyCode(office.code);
    setDeactivateError("");
    try {
      await deactivateOfficeAdmin(office.code);
      alert.success(`${office.name} deactivated.`);
      setConfirm(null);
    } catch (err) {
      // Show the backend's reason (e.g. active employees still assigned)
      // and leave the office as it is — no false success.
      setDeactivateError(err.message || "Could not deactivate the office.");
    } finally {
      setBusyCode(null);
      load();
    }
  };

  const reactivate = async (office) => {
    setBusyCode(office.code);
    try {
      await reactivateOfficeAdmin(office.code);
      alert.success(`${office.name} reactivated.`);
    } catch (err) {
      alert.error(err.message || "Could not reactivate the office.");
    } finally {
      setBusyCode(null);
      load();
    }
  };

  return (
    <div className="offices-panel">
      <div className="admin-panel-head offices-head">
        <h2>Offices</h2>
        <button type="button" className="admin-btn admin-btn-primary" onClick={openCreate}>
          Add Office
        </button>
      </div>

      <div className="admin-card offices-filters">
        <input
          type="search"
          className="offices-search"
          placeholder="Search by ID, name or location"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search offices"
        />
        <select
          className="offices-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="admin-card">
        {!loaded && <p className="admin-empty">Loading...</p>}
        {loaded && offices.length === 0 && <p className="admin-empty">No offices found.</p>}
        {offices.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Office ID</th>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Contact</th>
                  <th title="All accounts assigned to this office (staff, manager, HR, admin)">Assigned Accounts</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Last Edited By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offices.map((o) => (
                  <tr key={o.code}>
                    <td className="offices-code">{o.code}</td>
                    <td>{o.name}</td>
                    <td>{locationOf(o)}</td>
                    <td>
                      {o.phone || o.email ? (
                        <>
                          {o.phone && <div>{o.phone}</div>}
                          {o.email && <div>{o.email}</div>}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{o.employeeCount}</td>
                    <td>
                      <span
                        className={`admin-badge ${
                          o.isActive ? "admin-badge-converted" : "admin-badge-on_hold"
                        }`}
                      >
                        {o.isActive ? "Active" : "Inactive"}
                      </span>
                      {!o.isActive && o.deactivatedAt && (
                        <div className="offices-meta">
                          {o.deactivatedBy?.name ? `by ${o.deactivatedBy.name} · ` : ""}
                          {new Date(o.deactivatedAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td>{o.createdBy?.name || "—"}</td>
                    <td>
                      {o.updatedBy?.name || "—"}
                      {o.updatedBy && (
                        <div className="offices-meta">{new Date(o.updatedAt).toLocaleDateString()}</div>
                      )}
                    </td>
                    <td>
                      <div className="offices-actions">
                        <button type="button" className="admin-btn offices-btn" onClick={() => openEdit(o)}>
                          Edit
                        </button>
                        {o.isActive ? (
                          <button
                            type="button"
                            className="admin-btn offices-btn offices-btn-danger"
                            disabled={busyCode === o.code}
                            onClick={() => {
                              setDeactivateError("");
                              setConfirm(o);
                            }}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="admin-btn offices-btn"
                            disabled={busyCode === o.code}
                            onClick={() => reactivate(o)}
                          >
                            {busyCode === o.code ? "Working..." : "Reactivate"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / edit / created-result dialog */}
      {modal && (
        <div className="offices-overlay" onClick={closeModal}>
          <div
            className="admin-card offices-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {modal.mode === "created" ? (
              <>
                <h3>Office created</h3>
                <p className="offices-modal-note">
                  <strong>{modal.office.name}</strong> was added. Its office ID was generated
                  automatically:
                </p>
                <p className="offices-generated-id">{modal.office.code}</p>
                <div className="offices-modal-actions">
                  <button type="button" className="admin-btn admin-btn-primary" onClick={() => setModal(null)}>
                    Done
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={submit}>
                <h3>{modal.mode === "edit" ? "Edit Office" : "Add Office"}</h3>
                {modal.mode === "edit" ? (
                  <p className="offices-modal-note">
                    Office ID <span className="offices-code">{modal.office.code}</span> cannot be changed.
                  </p>
                ) : (
                  <p className="offices-modal-note">The office ID is generated automatically on save.</p>
                )}

                <div className="offices-form-grid">
                  <label className="admin-field offices-span-2">
                    <span>Office name</span>
                    <input required maxLength={120} value={form.name} onChange={update("name")} />
                  </label>
                  <label className="admin-field offices-span-2">
                    <span>Address (optional)</span>
                    <input maxLength={300} value={form.address} onChange={update("address")} />
                  </label>
                  <label className="admin-field">
                    <span>City (optional)</span>
                    <input maxLength={100} value={form.city} onChange={update("city")} />
                  </label>
                  <label className="admin-field">
                    <span>State (optional)</span>
                    <input maxLength={100} value={form.state} onChange={update("state")} />
                  </label>
                  <label className="admin-field">
                    <span>Country (optional)</span>
                    <input maxLength={100} value={form.country} onChange={update("country")} />
                  </label>
                  <label className="admin-field">
                    <span>Phone (optional)</span>
                    <input type="tel" maxLength={30} value={form.phone} onChange={update("phone")} />
                  </label>
                  <label className="admin-field offices-span-2">
                    <span>Email (optional)</span>
                    <input type="email" maxLength={254} value={form.email} onChange={update("email")} />
                  </label>
                </div>

                <div className="offices-modal-actions">
                  <button type="button" className="admin-btn" onClick={closeModal} disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                    {saving ? "Saving..." : modal.mode === "edit" ? "Save Changes" : "Create Office"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Deactivation confirmation */}
      {confirm && (
        <div className="offices-overlay" onClick={() => busyCode || setConfirm(null)}>
          <div
            className="admin-card offices-modal offices-modal-sm"
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Deactivate {confirm.name}?</h3>
            <p className="offices-modal-note">
              Inactive offices can no longer be assigned to new employees. Existing records keep
              showing this office. An office cannot be deactivated while ANY account (staff,
              manager, HR or admin) is still assigned to it — accounts have no separate
              active/inactive status, so every assigned account counts.
            </p>
            {deactivateError && <p className="offices-error">{deactivateError}</p>}
            <div className="offices-modal-actions">
              <button type="button" className="admin-btn" onClick={() => setConfirm(null)} disabled={!!busyCode}>
                {deactivateError ? "Close" : "Cancel"}
              </button>
              {!deactivateError && (
                <button
                  type="button"
                  className="admin-btn offices-btn-danger"
                  onClick={confirmDeactivate}
                  disabled={!!busyCode}
                >
                  {busyCode ? "Deactivating..." : "Deactivate"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
