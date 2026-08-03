import { site } from "../config/site";
import "./TopBar.css";
import { Link } from "react-router-dom";
import { useClientAuth } from "../context/ClientAuthContext";

export default function TopBar() {
  const { customer } = useClientAuth();

  return (
    <div className="topbar">
      <div className="container topbar-inner">
        <div className="topbar-contact">
          {/* <a href={site.contact.phoneHref} className="topbar-link">
            {site.contact.phoneDisplay}
          </a>
          <span className="topbar-divider" aria-hidden="true" />
          <a href={site.contact.emailHref} className="topbar-link">
            {site.contact.email}
          </a> */}
        </div>
        <div className="topbar-actions">
          <Link to="/track" className="topbar-link topbar-link--accent">Track Shipment</Link>
          <Link to={customer ? "/dashboard" : "/login"} className="topbar-link">
            {customer ? "My Account" : "Client Login"}
          </Link>
        </div>
      </div>
    </div>
  );
}
