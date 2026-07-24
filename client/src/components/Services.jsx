import { site } from "../config/site";
import { useReveal } from "../hooks/useReveal";
import "./Services.css";

function ServiceCard({ service, index }) {
  const [ref, visible] = useReveal(0.15);
  return (
    <article
      ref={ref}
      className={`service-card ${visible ? "is-in" : ""}`}
      style={{ transitionDelay: `${(index % 3) * 90}ms` }}
    >
      <span className="service-index">{String(index + 1).padStart(2, "0")}</span>
      <h3>{service.title}</h3>
      <p>{service.summary}</p>
      <a href="#contact" className="service-link">
        Read more <span aria-hidden="true">&rarr;</span>
      </a>
    </article>
  );
}

export default function Services() {
  const [headRef, headVisible] = useReveal(0.4);

  return (
    <section id="services" className="section services">
      <div className="container">
        <div
          ref={headRef}
          className={`section-head ${headVisible ? "is-in" : ""}`}
        >
          <span className="eyebrow">Our Services</span>
          <h2>One stop solution for every transportation need</h2>
          <p>
            Six connected service lines, coordinated by a single account
            team so nothing falls between the cracks.
          </p>
        </div>

        <div className="services-grid">
          {site.services.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
