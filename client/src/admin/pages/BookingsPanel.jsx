import { useEffect, useState } from "react";
import { listAllBookingsAdmin, updateBookingStatusAdmin } from "../../api/client";
import { useAlert } from "../../context/AlertContext";
import "./BookingsPanel.css";

const STATUSES = ["pending", "contacted", "converted", "rejected"];
const STATUS_LABELS = {
  pending: "Pending",
  contacted: "Contacted",
  converted: "Converted",
  rejected: "Rejected",
};

export default function BookingsPanel() {
  const alert = useAlert();
  const [bookings, setBookings] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const load = () => {
    listAllBookingsAdmin()
      .then((data) => setBookings(data.items))
      .catch((err) => alert.error(err.message || "Could not load booking requests."))
      .finally(() => setLoaded(true));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const changeStatus = async (id, status) => {
    setSavingId(id);
    try {
      const updated = await updateBookingStatusAdmin(id, status);
      setBookings((list) => list.map((b) => (b._id === id ? updated : b)));
    } catch (err) {
      alert.error(err.message || "Could not update status.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="bookings-panel">
      <div className="admin-panel-head">
        <h2>Booking Requests</h2>
      </div>

      <div className="admin-card">
        {!loaded && <p className="admin-empty">Loading...</p>}
        {loaded && bookings.length === 0 && <p className="admin-empty">No booking requests yet.</p>}
        {bookings.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Route</th>
                  <th>Cargo</th>
                  <th>Submitted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      {b.customer?.name}
                      <br />
                      <span className="bookings-customer-sub">
                        {b.customer?.email} · {b.customer?.phone}
                      </span>
                    </td>
                    <td>
                      {b.origin} → {b.destination}
                    </td>
                    <td>{b.cargoDetails}</td>
                    <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select
                        className="bookings-status-select"
                        value={b.status}
                        disabled={savingId === b._id}
                        onChange={(e) => changeStatus(b._id, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}