import { Link, useLocation } from "react-router-dom";

// A nav/CTA target is one of two things:
//   "/track"     — a real route, always a router <Link>
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
