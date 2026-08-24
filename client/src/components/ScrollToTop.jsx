import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router doesn't reset scroll position on navigation the way a
// full page load does — without this, clicking a footer/nav link to a
// different page lands you still scrolled down wherever you were.
// Skipped when a hash is present (e.g. "/#services") so it doesn't
// fight with Home.jsx's own scroll-to-anchor effect for that case.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
