import { useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import ShipmentsPanel from "./ShipmentsPanel";
import BookingsPanel from "./BookingsPanel";
import StaffPanel from "./StaffPanel";
import AnalyticsPanel from "./AnalyticsPanel";
import "./AdminDashboard.css";

// Tabs are driven entirely by the logged-in account's `permissions`
// array (computed server-side from role + server/src/config/permissions.js
// — see authController.js `shape()`), not a hardcoded role check. Adding
// a new role later, or changing what a role can see, is a change to
// that one server-side config file — this component never needs
// touching again for that.
const TABS = [
  { key: "shipments", label: "Shipments", permission: "shipments:view" },
  { key: "bookings", label: "Booking Requests", permission: "bookings:view" },
  { key: "staff", label: "Team", permission: "team:view" },
  { key: "analytics", label: "Audit & Analytics", permission: "analytics:view" },
];

function hasPermission(permissions, needed) {
  if (!permissions) return false;
  return permissions.includes("*") || permissions.includes(needed);
}

export default function AdminDashboard() {
  const { staff } = useAdminAuth();
  const visibleTabs = TABS.filter((t) => hasPermission(staff?.permissions, t.permission));
  const [tab, setTab] = useState(visibleTabs[0]?.key || "shipments");

  return (
    <div className="admin-dashboard">
      <nav className="admin-tabs">
        {visibleTabs.map((t) => (
          <button
            key={t.key}
            className={`admin-tab ${tab === t.key ? "is-active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "shipments" && hasPermission(staff?.permissions, "shipments:view") && <ShipmentsPanel />}
      {tab === "bookings" && hasPermission(staff?.permissions, "bookings:view") && <BookingsPanel />}
      {tab === "staff" && hasPermission(staff?.permissions, "team:view") && <StaffPanel />}
      {tab === "analytics" && hasPermission(staff?.permissions, "analytics:view") && <AnalyticsPanel />}
    </div>
  );
}
