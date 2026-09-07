import { Fragment, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { site } from "../config/site";
import { serviceDetails } from "../config/serviceDetails";
import { slugify } from "../utils/slugify";
import SmartLink from "./SmartLink";
import "./Navbar.css";

// Services/Sectors submenus aren't hardcoded in config/site.js — they're
// built here from the same `services`/`sectors` lists that already drive
// those sections, so the nav dropdown can never drift out of sync with
// the actual cards on the page.
//
// Each Services item links straight to its own "Read More" detail page
// (/services/<id>) when one has actually been written in
// serviceDetails.js. If a service doesn't have one yet, it falls back to
// the general #services section instead — same destination as the
// "Services" parent link itself — rather than linking to a detail page
// that would just redirect back to "/" (see ServiceDetailPage.jsx's
// `if (!service || !detail) return <Navigate to="/" />`). Add a new
// service to serviceDetails.js later and its submenu link upgrades to
// the detail page automatically, no change needed here.
function buildNavItems() {
  return site.nav.map((item) => {
    if (item.label === "Solutions") {
      return {
        ...item,
        submenu: site.services.map((s) => ({
          label: s.title,
          href: serviceDetails[s.id] ? `/services/${s.id}` : `#service-${s.id}`,
        })),
      };
    }
    return item;
  });
}

export default function Navbar({ onOpenQuote }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null); // mobile: which parent's submenu is expanded

  const navItems = buildNavItems();

  const isNavItemActive = (item) => {
  if (!item.submenu) {
    if (item.href === "#home") {
      return location.pathname === "/" && location.hash === "";
    }

    if (item.href.startsWith("#")) {
      return location.pathname === "/" && location.hash === item.href;
    }

    return location.pathname === item.href;
  }

  return item.submenu.some((sub) => {
    if (sub.href.startsWith("#")) {
      return location.pathname === "/" && location.hash === sub.href;
    }

    return location.pathname === sub.href;
  });
};

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  // Don't carry an expanded submenu into the next time the mobile menu
  // is opened — it should always start collapsed.
  useEffect(() => {
    if (!menuOpen) setOpenSubmenu(null);
  }, [menuOpen]);

  const closeMobileMenu = () => setMenuOpen(false);

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="container navbar-inner">
        <SmartLink href="#home" className="navbar-brand">
          <img src="/logo.webp" alt={site.companyName} className="navbar-brand-mark" />
          <span className="navbar-brand-name">{site.companyName}</span>
        </SmartLink>

 <nav className="navbar-links" aria-label="Primary">
  {navItems.map((item) =>
    item.submenu ? (
      <div
        key={item.href}
        className={`navbar-item has-submenu ${
          openSubmenu === item.label ? "is-open" : ""
        }`}
        onMouseEnter={() => setOpenSubmenu(item.label)}
        onMouseLeave={() => setOpenSubmenu(null)}
      >
        {/* Parent navigation link */}
<SmartLink
  href={item.href}
  className={`navbar-item-label ${
    isNavItemActive(item) ? "active" : ""
  }`}
>
  {item.label}
  <span className="navbar-caret" aria-hidden="true" />
</SmartLink>

        {/* Dropdown */}
        <div className="navbar-dropdown">
          <div className="navbar-dropdown-inner">
            {item.submenu.map((sub) => (
              <SmartLink
                key={sub.href}
                href={sub.href}
                className="navbar-dropdown-link"
                onClick={() => {
                  setMenuOpen(false);
                  setOpenSubmenu(null);
                }}
              >
                {sub.label}
              </SmartLink>
            ))}
          </div>
        </div>
      </div>
    ) : (
      /* Normal navigation link */
<SmartLink
  key={item.href}
  href={item.href}
  className={isNavItemActive(item) ? "active" : ""}
>
  {item.label}
</SmartLink>
    )
  )}
</nav>

        <div className="navbar-cta">
          <button className="btn btn-primary" onClick={onOpenQuote}>
            Get a Quote
          </button>
        </div>

        <button
          className={`navbar-burger ${menuOpen ? "is-open" : ""}`}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <div className={`navbar-mobile ${menuOpen ? "is-open" : ""}`}>
        <div className="navbar-mobile-content">
          <nav className="navbar-mobile-links">
            {navItems.map((item, i) => (
              <Fragment key={item.href}>
                {item.submenu ? (
                  <>
                    <button
                      type="button"
                      className={`navbar-mobile-parent ${
                        openSubmenu === item.label ? "is-open" : ""
                      }`}
                      style={{ transitionDelay: `${i * 40}ms` }}
                      aria-expanded={openSubmenu === item.label}
                      onClick={() =>
                        setOpenSubmenu((cur) => (cur === item.label ? null : item.label))
                      }
                    >
                      {item.label}
                      <span className="navbar-mobile-caret" aria-hidden="true" />
                    </button>
                    <div
                      className={`navbar-mobile-submenu-wrap ${
                        openSubmenu === item.label ? "is-open" : ""
                      }`}
                    >
                      <div className="navbar-mobile-submenu-inner">
                        {item.submenu.map((sub) => (
                          <SmartLink
                            key={sub.href}
                            href={sub.href}
                            className="navbar-mobile-sublink"
                            onClick={closeMobileMenu}
                          >
                            {sub.label}
                          </SmartLink>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <SmartLink
                    href={item.href}
                    style={{ transitionDelay: `${i * 40}ms` }}
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </SmartLink>
                )}
              </Fragment>
            ))}
          </nav>
          <button
            className="btn btn-primary navbar-mobile-cta"
            onClick={() => {
              closeMobileMenu();
              onOpenQuote();
            }}
          >
            Get a Quote
          </button>
        </div>
      </div>
    </header>
  );
}
