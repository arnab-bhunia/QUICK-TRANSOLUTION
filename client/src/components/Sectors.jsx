import { site } from "../config/site";
import { useReveal } from "../hooks/useReveal";
import "./Sectors.css";

export default function Sectors() {
  const [ref, visible] = useReveal(0.3);

  return (
    <section id="sectors" className="section sectors">
      <div className="container">
        <div className={`section-head ${visible ? "is-in" : ""}`} ref={ref}>
          <span className="eyebrow">Our Key Sectors</span>
          <h2>Comprehensive logistics for major <span className="header-span">Industries</span></h2>
        </div>

        <div className="sectors-grid">
          {site.sectors.map((sector, i) => (
            <a
              href="#contact"
              key={sector}
              className={`sector-chip ${visible ? "is-in" : ""}`}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              {sector}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
