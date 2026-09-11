import { Link, useLocation } from "react-router-dom";

// A nav/CTA target is one of three things:
//   "/track"     — a real route, always a router <Link>
//   "#home"      — "go to the very top of the home page", NOT a jump to
//                  a specific element. Hero.jsx happens to render
//                  id="home", but that section sits below TopBar/
//                  Navbar/SecurityMarquee — scrolling to its top leaves
//                  the page part-way down, so the (non-sticky) TopBar
//                  scrolls out of view. Handled separately below so
//                  clicking "Home" always lands at true scrollY 0,
//                  matching the page's initial landing state.
//   "#services"  — a same-page section anchor
// For the hash case: on "/" it's a plain native anchor (browser handles
// the smooth-scroll via the CSS `scroll-behavior: smooth` already set
// site-wide). From any OTHER page, a native anchor would do nothing
// (there's no #services element on /track) — so it becomes a <Link
// to="/#services">, and Home.jsx's hash effect does the scroll once
// we land back on "/".
export default function SmartLink({ href, className, style, onClick, children }) {
  const { pathname } = useLocation();
  const isHash = href.startsWith("#");

  if (href === "#home") {
    if (pathname === "/") {
      return (
        <a
          href="/"
          className={className}
          style={style}
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
            onClick?.();
          }}
        >
          {children}
        </a>
      );
    }

    return (
      <Link to="/" className={className} style={style} onClick={onClick}>
        {children}
      </Link>
    );
  }

  if (!isHash) {
    return (
      <Link to={href} className={className} style={style} onClick={onClick}>
        {children}
      </Link>
    );
  }

  if (pathname === "/") {
    return (
      <a href={href} className={className} style={style} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <Link to={`/${href}`} className={className} style={style} onClick={onClick}>
      {children}
    </Link>
  );
}