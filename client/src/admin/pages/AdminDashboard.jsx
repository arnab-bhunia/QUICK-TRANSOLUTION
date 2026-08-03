import { useState } from "react";
import ShipmentsPanel from "./ShipmentsPanel";
import BookingsPanel from "./BookingsPanel";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [tab, setTab] = useState("shipments");

  return (
    <div className="admin-dashboard">
      <nav className="admin-tabs">
        <button
          className={`admin-tab ${tab === "shipments" ? "is-active" : ""}`}
          onClick={() => setTab("shipments")}
        >
          Shipments
        </button>
        <button
          className={`admin-tab ${tab === "bookings" ? "is-active" : ""}`}
          onClick={() => setTab("bookings")}
        >
          Booking Requests
        </button>
      </nav>

      {tab === "shipments" ? <ShipmentsPanel /> : <BookingsPanel />}
    </div>
  );
}
