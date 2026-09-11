import { Link } from "react-router-dom";
import { site } from "../config/site";
import { useReveal } from "../hooks/useReveal";
import "./About.css";

/*
 * A short, concise company introduction for Home — the detailed version
 * lives on /company-profile#about (config/company.js), reached through
 * the "More" link below. Keeping this section brief on purpose: Home
 * stays conversion-focused, Company Profile is where the depth lives.
 */
export default function About() {
  const [ref, visible] = useReveal(0.25);

  return (
    <section id="about-home" className="section about-home">
      <div className="container">
        <div ref={ref} className={`section-head about-home-inner ${visible ? "is-in" : ""}`}>
          <span className="eyebrow">About {site.companyName}</span>
          <h2>Moving India forward, one <span className="header-span">journey</span> at a time</h2>         
          <p>
            {site.legalName} is a single-window logistics partner, bringing
            transportation, warehousing, customs clearance and documentation
            support together under one company instead of several separate
            vendors. We move freight across India, Nepal, Bhutan and
            Bangladesh by road, rail, air and sea, with GPS-enabled tracking
            so customers always know where a shipment stands.
          </p>
          <Link to="/company-profile#about" className="about-home-more">
            More <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
