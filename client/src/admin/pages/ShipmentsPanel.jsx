import { useEffect, useState } from "react";
import {
  listShipmentsAdmin,
  createShipmentAdmin,
  updateShipmentStatusAdmin,
  updateShipmentVisibilityAdmin,
  getShipmentAuditAdmin,
} from "../../api/client";
import { useAlert } from "../../context/AlertContext";
import "./ShipmentsPanel.css";

const STATUSES = ["booked", "picked_up", "in_transit", "out_for_delivery", "delivered", "on_hold"];
const STATUS_LABELS = {
  booked: "Booked",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  on_hold: "On Hold",
};

const emptyCreateForm = {
  senderName: "",
  senderPhone: "",
  receiverName: "",
  receiverPhone: "",
  origin: "",
  destination: "",
  visibility: "private",
  estimatedDelivery: "",
};

export default function ShipmentsPanel() {
  const alert = useAlert();
  const [shipments, setShipments] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [createStatus, setCreateStatus] = useState("idle");
  const [selected, setSelected] = useState(null);

  const loadShipments = () => {
    listShipmentsAdmin()
      .then((data) => setShipments(data.items))
      .catch((err) => alert.error(err.message || "Could not load shipments."))
      .finally(() => setLoaded(true));
  };

  useEffect(loadShipments, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateCreateField = (field) => (e) =>
    setCreateForm((f) => ({ ...f, [field]: e.target.value }));

  const submitCreate = async (e) => {
    e.preventDefault();
    setCreateStatus("loading");
    try {
      const result = await createShipmentAdmin(createForm);
      alert.success(`Shipment created — tracking ID ${result.trackingId}`);
      setCreateForm(emptyCreateForm);
      setShowCreate(false);
      loadShipments();
    } catch (err) {
      alert.error(err.message || "Could not create shipment.");
    } finally {
      setCreateStatus("idle");
    }
  };

  return (
    <div className="shipments-panel">
      <div className="admin-panel-head">
        <h2>Shipments</h2>
        <button className="admin-btn admin-btn-primary" onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? "Cancel" : "+ New Shipment"}
        </button>
      </div>

      {showCreate && (
        <form className="admin-card shipment-create-form" onSubmit={submitCreate}>
          <div className="shipment-create-grid">
            <label className="admin-field">
              <span>Sender name</span>
              <input required value={createForm.senderName} onChange={updateCreateField("senderName")} />
            </label>
            <label className="admin-field">
              <span>Sender phone</span>
              <input required value={createForm.senderPhone} onChange={updateCreateField("senderPhone")} />
            </label>
            <label className="admin-field">
              <span>Receiver name</span>
              <input required value={createForm.receiverName} onChange={updateCreateField("receiverName")} />
            </label>
            <label className="admin-field">
              <span>Receiver phone</span>
              <input
                required
                value={createForm.receiverPhone}
                onChange={updateCreateField("receiverPhone")}
              />
            </label>
            <label className="admin-field">
              <span>Origin</span>
              <input required value={createForm.origin} onChange={updateCreateField("origin")} />
            </label>
            <label className="admin-field">
              <span>Destination</span>
              <input required value={createForm.destination} onChange={updateCreateField("destination")} />
            </label>
            <label className="admin-field">
              <span>Visibility</span>
              <select value={createForm.visibility} onChange={updateCreateField("visibility")}>
                <option value="private">Private (requires phone verification)</option>
                <option value="public">Public</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Estimated delivery</span>
              <input
                type="date"
                value={createForm.estimatedDelivery}
                onChange={updateCreateField("estimatedDelivery")}
              />
            </label>
          </div>
          <button className="admin-btn admin-btn-primary" disabled={createStatus === "loading"}>
            {createStatus === "loading" ? "Creating..." : "Create Shipment"}
          </button>
        </form>
      )}

      <div className="admin-card">
        {!loaded && <p className="admin-empty">Loading...</p>}
        {loaded && shipments.length === 0 && <p className="admin-empty">No shipments yet.</p>}
        {shipments.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Visibility</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => (
                  <tr key={s._id} onClick={() => setSelected(s.trackingId)} className="admin-row-clickable">
                    <td>{s.trackingId}</td>
                    <td>
                      {s.origin} → {s.destination}
                    </td>
                    <td>
                      <span className={`admin-badge admin-badge-${s.currentStatus}`}>
                        {STATUS_LABELS[s.currentStatus] || s.currentStatus}
                      </span>
                    </td>
                    <td>{s.visibility}</td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <ShipmentDetail
          trackingId={selected}
          onClose={() => setSelected(null)}
          onUpdated={loadShipments}
        />
      )}
    </div>
  );
}

function ShipmentDetail({ trackingId, onClose, onUpdated }) {
  const alert = useAlert();
  const [statusForm, setStatusForm] = useState({ status: "", location: "", note: "" });
  const [statusSaving, setStatusSaving] = useState(false);
  const [visibilitySaving, setVisibilitySaving] = useState(false);
  const [audit, setAudit] = useState([]);
  const [auditLoaded, setAuditLoaded] = useState(false);

  useEffect(() => {
    getShipmentAuditAdmin(trackingId)
      .then(setAudit)
      .catch(() => {})
      .finally(() => setAuditLoaded(true));
  }, [trackingId]);

  const submitStatus = async (e) => {
    e.preventDefault();
    if (!statusForm.status) return;
    setStatusSaving(true);
    try {
      await updateShipmentStatusAdmin(trackingId, statusForm);
      alert.success("Status updated.");
      setStatusForm({ status: "", location: "", note: "" });
      onUpdated();
    } catch (err) {
      alert.error(err.message || "Could not update status.");
    } finally {
      setStatusSaving(false);
    }
  };

  const toggleVisibility = async (visibility) => {
    setVisibilitySaving(true);
    try {
      await updateShipmentVisibilityAdmin(trackingId, { visibility });
      alert.success(`Visibility set to ${visibility}.`);
      onUpdated();
    } catch (err) {
      alert.error(err.message || "Could not update visibility.");
    } finally {
      setVisibilitySaving(false);
    }
  };

  return (
    <div className="admin-card shipment-detail">
      <div className="admin-panel-head">
        <h3>{trackingId}</h3>
        <button className="admin-btn admin-btn-ghost" onClick={onClose}>
          Close
        </button>
      </div>

      <form className="shipment-status-form" onSubmit={submitStatus}>
        <label className="admin-field">
          <span>New status</span>
          <select
            required
            value={statusForm.status}
            onChange={(e) => setStatusForm((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="">Select...</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          <span>Location</span>
          <input
            value={statusForm.location}
            onChange={(e) => setStatusForm((f) => ({ ...f, location: e.target.value }))}
          />
        </label>
        <label className="admin-field">
          <span>Note (optional)</span>
          <input
            value={statusForm.note}
            onChange={(e) => setStatusForm((f) => ({ ...f, note: e.target.value }))}
          />
        </label>
        <button className="admin-btn admin-btn-primary" disabled={statusSaving}>
          {statusSaving ? "Updating..." : "Update Status"}
        </button>
      </form>

      <div className="shipment-visibility-row">
        <span>Visibility:</span>
        <button
          className="admin-btn admin-btn-ghost"
          disabled={visibilitySaving}
          onClick={() => toggleVisibility("public")}
        >
          Set Public
        </button>
        <button
          className="admin-btn admin-btn-ghost"
          disabled={visibilitySaving}
          onClick={() => toggleVisibility("private")}
        >
          Set Private
        </button>
      </div>

      <h4 className="shipment-audit-heading">Audit Log</h4>
      {!auditLoaded && <p className="admin-empty">Loading...</p>}
      {auditLoaded && audit.length === 0 && <p className="admin-empty">No audit entries yet.</p>}
      <ul className="shipment-audit-list">
        {audit.map((entry) => (
          <li key={entry._id}>
            <span className="admin-badge admin-badge-booked">{entry.action}</span>
            <span className="shipment-audit-meta">
              {entry.performedBy?.name ? `by ${entry.performedBy.name}` : "public visitor"} ·{" "}
              {new Date(entry.createdAt).toLocaleString()} · {entry.ipAddress}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}