import { site } from "../config/site";
import "./TopBar.css";
import { Link } from "react-router-dom";

export default function TopBar() {
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
          <a href="#login" className="topbar-link">
            Client Login
          </a>
        </div>
      </div>
    </div>
  );
}
