import { useEffect, useState } from "react";
import { getAnalyticsAdmin } from "../../api/client";
import { useAlert } from "../../context/AlertContext";
import "./AnalyticsPanel.css";

const SHIPMENT_STATUS_LABELS = {
  booked: "Booked",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  on_hold: "On Hold",
};

const BOOKING_STATUS_LABELS = {
  pending: "Pending",
  contacted: "Contacted",
  converted: "Converted",
  rejected: "Rejected",
};

export default function AnalyticsPanel() {
  const alert = useAlert();
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getAnalyticsAdmin()
      .then(setData)
      .catch((err) => alert.error(err.message || "Could not load analytics."))
      .finally(() => setLoaded(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!loaded) {
    return (
      <div className="analytics-panel">
        <p className="admin-empty">Loading...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="analytics-panel">
      <div className="admin-panel-head">
        <h2>Audit & Analytics</h2>
      </div>

      <div className="analytics-stats-row">
        <div className="admin-card analytics-stat">
          <span className="analytics-stat-value">{data.totalShipments}</span>
          <span className="analytics-stat-label">Total Shipments</span>
        </div>
        <div className="admin-card analytics-stat">
          <span className="analytics-stat-value">{data.totalBookings}</span>
          <span className="analytics-stat-label">Total Booking Requests</span>
        </div>
      </div>

      <div className="analytics-breakdown-row">
        <div className="admin-card">
          <h3>Shipments by Status</h3>
          <ul className="analytics-breakdown-list">
            {Object.entries(SHIPMENT_STATUS_LABELS).map(([key, label]) => (
              <li key={key}>
                <span>{label}</span>
                <span className="analytics-count">{data.shipmentsByStatus[key] || 0}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-card">
          <h3>Bookings by Status</h3>
          <ul className="analytics-breakdown-list">
            {Object.entries(BOOKING_STATUS_LABELS).map(([key, label]) => (
              <li key={key}>
                <span>{label}</span>
                <span className="analytics-count">{data.bookingsByStatus[key] || 0}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="admin-card">
        <h3>Recent Activity — All Shipments</h3>
        {data.recentActivity.length === 0 && <p className="admin-empty">No activity yet.</p>}
        <ul className="analytics-activity-list">
          {data.recentActivity.map((entry) => (
            <li key={entry._id}>
              <span className="admin-badge admin-badge-booked">{entry.action}</span>
              <span className="analytics-activity-meta">
                {entry.trackingId && `${entry.trackingId} · `}
                {entry.performedBy?.name ? `by ${entry.performedBy.name}` : "public visitor"} ·{" "}
                {new Date(entry.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
