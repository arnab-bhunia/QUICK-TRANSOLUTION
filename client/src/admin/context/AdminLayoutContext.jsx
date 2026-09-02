import { createContext, useContext, useEffect, useState } from "react";

const AdminLayoutContext = createContext(null);

const COLLAPSE_KEY = "admin-sidebar-collapsed";

// Holds the sidebar's desktop collapsed/expanded state (persisted, since
// it's a layout preference) and its mobile open/closed state (never
// persisted — a drawer should always start closed on a fresh page load).
export function AdminLayoutProvider({ children }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch {
      // Private browsing / storage disabled — the preference just won't
      // persist across reloads, which is fine, not worth surfacing.
    }
  }, [collapsed]);

  const value = {
    collapsed,
    toggleCollapsed: () => setCollapsed((c) => !c),
    mobileOpen,
    closeMobile: () => setMobileOpen(false),
    toggleMobile: () => setMobileOpen((o) => !o),
  };

  return <AdminLayoutContext.Provider value={value}>{children}</AdminLayoutContext.Provider>;
}

export function useAdminLayout() {
  const ctx = useContext(AdminLayoutContext);
  if (!ctx) throw new Error("useAdminLayout must be used within AdminLayoutProvider");
  return ctx;
}
