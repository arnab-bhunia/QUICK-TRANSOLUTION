import { useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import ShipmentsPanel from "./ShipmentsPanel";
import BookingsPanel from "./BookingsPanel";
import StaffPanel from "./StaffPanel";
import AnalyticsPanel from "./AnalyticsPanel";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { staff } = useAdminAuth();
  const isAdmin = staff?.role === "admin";
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
        {/* Staff management + analytics are admin-only capabilities —
            a regular staff login never sees these tabs at all. */}
        {isAdmin && (
          <>
            <button
              className={`admin-tab ${tab === "staff" ? "is-active" : ""}`}
              onClick={() => setTab("staff")}
            >
              Staff
            </button>
            <button
              className={`admin-tab ${tab === "analytics" ? "is-active" : ""}`}
              onClick={() => setTab("analytics")}
            >
              Audit & Analytics
            </button>
          </>
        )}
      </nav>

      {tab === "shipments" && <ShipmentsPanel />}
      {tab === "bookings" && <BookingsPanel />}
      {tab === "staff" && isAdmin && <StaffPanel />}
      {tab === "analytics" && isAdmin && <AnalyticsPanel />}
    </div>
  );
}
