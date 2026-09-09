import { useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import ShipmentsPanel from "./ShipmentsPanel";
import BookingsPanel from "./BookingsPanel";
import StaffPanel from "./StaffPanel";
import AnalyticsPanel from "./AnalyticsPanel";
import AdminSidebar from "../AdminSidebar";
import { ShipmentsIcon, BookingsIcon, TeamIcon, AnalyticsIcon,BlogIcon,ServiceEnquiriesIcon,} from "../icons";
import "./AdminDashboard.css";
import BlogManagement from "./BlogManagement";
import ServiceEnquiriesPanel from "./serviceEnquiries/ServiceEnquiriesPanel";

// Tabs are driven entirely by the logged-in account's `permissions`
// array (computed server-side from role + server/src/config/permissions.js
// — see authController.js `shape()`), not a hardcoded role check. Adding
// a new role later, or changing what a role can see, is a change to
// that one server-side config file — this component never needs
// touching again for that.
//
// `subTabs` is optional — only add it to a tab that has a natural
// split. When present, the sidebar renders an expandable sub-nav under
// that tab and the chosen sub-tab's key is passed to the panel as its
// `view` prop, e.g. StaffPanel's own directory/add-member split below.
const TABS = [
  { key: "shipments", label: "Shipments", permission: "shipments:view", icon: ShipmentsIcon },
  { key: "bookings", label: "Booking Requests", permission: "bookings:view", icon: BookingsIcon },
  {
    key: "staff",
    label: "Team",
    permission: "team:view",
    icon: TeamIcon,
    subTabs: [
      { key: "directory", label: "Directory" },
      { key: "add", label: "Add Member" },
    ],
  },
  {
    key: "analytics",
    label: "Audit & Analytics",
    permission: "analytics:view",
    icon: AnalyticsIcon,
  },
  {
  key: "blogs",
  label: "Blogs",
  permission: "blog:view",
  icon: BlogIcon,
},
{
  key: "service-enquiries",
  label: "Service Enquiries",
  permission: "service_enquiries:view",
  icon: ServiceEnquiriesIcon,
},
];

function hasPermission(permissions, needed) {
  if (!permissions) return false;
  return permissions.includes("*") || permissions.includes(needed);
}

export default function AdminDashboard() {
  const { staff } = useAdminAuth();
  const visibleTabs = TABS.filter((t) => hasPermission(staff?.permissions, t.permission));
  const firstTab = visibleTabs[0];
  const [tab, setTab] = useState(firstTab?.key || "shipments");
  const [subTab, setSubTab] = useState(firstTab?.subTabs?.[0]?.key || null);

  const selectTab = (key, sub) => {
    const cfg = visibleTabs.find((t) => t.key === key);
    setTab(key);
    setSubTab(sub || cfg?.subTabs?.[0]?.key || null);
  };

  return (
    <div className="admin-body">
      <AdminSidebar tabs={visibleTabs} activeTab={tab} activeSub={subTab} onSelect={selectTab} />

      <main className="admin-main">
        {tab === "shipments" && hasPermission(staff?.permissions, "shipments:view") && (
          <ShipmentsPanel />
        )}
        {tab === "bookings" && hasPermission(staff?.permissions, "bookings:view") && (
          <BookingsPanel />
        )}
        {tab === "staff" && hasPermission(staff?.permissions, "team:view") && (
          <StaffPanel view={subTab} />
        )}
        {tab === "service-enquiries" && hasPermission(staff?.permissions, "service_enquiries:view") && (
          <ServiceEnquiriesPanel permissions={staff?.permissions} />
        )}
        {tab === "analytics" && hasPermission(staff?.permissions, "analytics:view") && (
          <AnalyticsPanel />
        )}
        {tab === "blogs" && hasPermission(staff?.permissions, "blog:view") && (
          <BlogManagement />
        )}
      </main>
    </div>
  );
}
