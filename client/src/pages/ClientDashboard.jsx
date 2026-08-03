import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClientAuth } from "../context/ClientAuthContext";
import { useAlert } from "../context/AlertContext";
import { createBooking, listMyBookings } from "../api/client";
import "./ClientDashboard.css";

const STATUS_LABELS = {
  pending: "Pending",
  contacted: "Contacted",
  converted: "Converted",
  rejected: "Rejected",
};

const emptyForm = {
  origin: "",
  destination: "",
  cargoDetails: "",
  preferredDate: "",
  notes: "",
};

export default function ClientDashboard() {
  const { customer, loading, logout } = useClientAuth();
  const alert = useAlert();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("idle");
  const [bookings, setBookings] = useState([]);
  const [bookingsLoaded, setBookingsLoaded] = useState(false);

  // Protected route: bounce to /login once we know for sure there's no
  // logged-in customer (wait for the initial /me check to finish first).
  useEffect(() => {
    if (!loading && !customer) {
      navigate("/login");
    }
  }, [loading, customer, navigate]);

  useEffect(() => {
    if (!customer) return;
    listMyBookings()
      .then(setBookings)
      .catch(() => {})
      .finally(() => setBookingsLoaded(true));
  }, [customer]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const booking = await createBooking(form);
      setBookings((list) => [booking, ...list]);
      setForm(emptyForm);
      alert.success("Request received — our expert will reach out to you shortly.");
    } catch (err) {
      alert.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setStatus("idle");
    }
  };

  if (loading || !customer) {
    return null;
  }

  return (
    <section className="section client-dashboard">
      <div className="container">
        <div className="client-dashboard-head">
          <div>
            <span className="eyebrow">Client Dashboard</span>
            <h1>Welcome back, {customer.name.split(" ")[0]}</h1>
          </div>
          <button
            className="btn btn-outline"
            onClick={async () => {
              await logout();
              navigate("/");
            }}
          >
            Log out
          </button>
        </div>

        <div className="client-dashboard-grid">
          <form className="client-booking-form" onSubmit={submit}>
            <h2>Book a Shipment</h2>

            <label className="client-auth-field">
              <span>Origin</span>
              <input type="text" required value={form.origin} onChange={update("origin")} />
            </label>

            <label className="client-auth-field">
              <span>Destination</span>
              <input
                type="text"
                required
                value={form.destination}
                onChange={update("destination")}
              />
            </label>

            <label className="client-auth-field">
              <span>Cargo details</span>
              <textarea
                required
                rows={3}
                value={form.cargoDetails}
                onChange={update("cargoDetails")}
                placeholder="Type of goods, approximate weight/volume, etc."
              />
            </label>

            <label className="client-auth-field">
              <span>Preferred pickup date</span>
              <input type="date" value={form.preferredDate} onChange={update("preferredDate")} />
            </label>

            <label className="client-auth-field">
              <span>Additional notes</span>
              <textarea rows={2} value={form.notes} onChange={update("notes")} />
            </label>

            <button className="btn btn-primary client-auth-submit" disabled={status === "loading"}>
              {status === "loading" ? "Submitting..." : "Submit"}
            </button>

            <p className="client-form-note">
              Our expert will reach out to you shortly after reviewing your request.
            </p>
          </form>

          <div className="client-bookings-list">
            <h2>Your Booking Requests</h2>
            {!bookingsLoaded && <p className="client-bookings-empty">Loading...</p>}
            {bookingsLoaded && bookings.length === 0 && (
              <p className="client-bookings-empty">No booking requests yet.</p>
            )}
            {bookings.map((b) => (
              <div key={b._id} className="client-booking-card">
                <div className="client-booking-card-top">
                  <span className={`client-booking-status status-${b.status}`}>
                    {STATUS_LABELS[b.status] || b.status}
                  </span>
                  <span className="client-booking-date">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="client-booking-route">
                  {b.origin} → {b.destination}
                </p>
                <p className="client-booking-cargo">{b.cargoDetails}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
