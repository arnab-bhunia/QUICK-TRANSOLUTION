import { AnimatePresence, motion } from "framer-motion";
import { useAdminLayout } from "./context/AdminLayoutContext";
import { ChevronIcon, CloseIcon } from "./icons";
import "./AdminSidebar.css";

// tabs: [{ key, label, icon, subTabs?: [{ key, label }] }]
// A tab only shows an expandable sub-nav if it defines subTabs — most
// tabs won't, and that's fine, this renders identically to a flat item.
export default function AdminSidebar({ tabs, activeTab, activeSub, onSelect }) {
  const { collapsed, toggleCollapsed, mobileOpen, closeMobile } = useAdminLayout();

  // Any selection (top-level or sub-item) also closes the mobile drawer,
  // so tapping a destination is the natural way to dismiss it — no
  // separate "close then navigate" step on a phone.
  const handleSelect = (key, sub) => {
    onSelect(key, sub);
    closeMobile();
  };

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="admin-sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeMobile}
          />
        )}
      </AnimatePresence>

      <aside
        className={`admin-sidebar ${collapsed ? "is-collapsed" : ""} ${
          mobileOpen ? "is-mobile-open" : ""
        }`}
      >
        {/* Only visible on mobile (see CSS) — the drawer carries its own
            brand + close affordance instead of relying on header alignment,
            since a fixed drawer can't reliably know the topbar's height. */}
        <div className="admin-sidebar-mobile-head">
          <span className="admin-sidebar-brand">Quick Transolution</span>
          <button
            type="button"
            className="admin-sidebar-close"
            onClick={closeMobile}
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {tabs.map((t) => {
            const isActive = activeTab === t.key;
            const Icon = t.icon;
            return (
              <div key={t.key} className="admin-sidebar-group">
                <button
                  type="button"
                  className={`admin-sidebar-item ${isActive ? "is-active" : ""}`}
                  onClick={() => handleSelect(t.key)}
                  title={collapsed ? t.label : undefined}
                >
                  <span className="admin-sidebar-icon">
                    <Icon />
                  </span>
                  <span className="admin-sidebar-label">{t.label}</span>
                  {t.subTabs && (
                    <span className={`admin-sidebar-chevron ${isActive ? "is-open" : ""}`}>
                      <ChevronIcon />
                    </span>
                  )}
                </button>

                {t.subTabs && isActive && (
                  <div className="admin-sidebar-subnav">
                    {t.subTabs.map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        className={`admin-sidebar-subitem ${
                          activeSub === s.key ? "is-active" : ""
                        }`}
                        onClick={() => handleSelect(t.key, s.key)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <button
          type="button"
          className="admin-sidebar-collapse-btn"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronIcon style={{ transform: collapsed ? "none" : "rotate(180deg)" }} />
          <span className="admin-sidebar-label">{collapsed ? "" : "Collapse"}</span>
        </button>
      </aside>
    </>
  );
}
