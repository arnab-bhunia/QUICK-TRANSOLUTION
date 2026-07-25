import { useEffect, useState } from "react";
import { site } from "../config/site";
import "./Navbar.css";

export default function Navbar({ onOpenQuote }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="container navbar-inner">
        <a href="#home" className="navbar-brand">
          <img src="/logo.png" alt={site.companyName} className="navbar-brand-mark" />
          <span className="navbar-brand-name">{site.companyName}</span>
        </a>

        <nav className="navbar-links" aria-label="Primary">
          {site.nav.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
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
        <nav className="navbar-mobile-links">
          {site.nav.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              style={{ transitionDelay: `${i * 40}ms` }}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <button
          className="btn btn-primary navbar-mobile-cta"
          onClick={() => {
            setMenuOpen(false);
            onOpenQuote();
          }}
        >
          Get a Quote
        </button>
      </div>
    </header>
  );
}
