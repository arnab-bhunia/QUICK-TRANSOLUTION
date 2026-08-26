import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { site } from "../config/site";
import { serviceDetails } from "../config/serviceDetails";
import { useReveal } from "../hooks/useReveal";
import StickyEnquireBar from "../components/StickyEnquireBar";
import ServiceEnquiryModal from "../components/ServiceEnquiryModal";
import "./ServiceDetailPage.css";

/*
 * One component drives all 6 "Read More" pages instead of 6 near-identical
 * files — the same request could've been met with 6 copy-pasted
 * components, but that means 6 places to fix the next time the layout or
 * behavior needs a change. Content differs per service through
 * config/serviceDetails.js (keyed by the same `id` already used in
 * site.services), which is what actually gives you 6 distinct pages —
 * one per slug in the URL, e.g. /services/warehousing.
 */
export default function ServiceDetailPage() {
  const { slug } = useParams();
  const [enquireOpen, setEnquireOpen] = useState(false);
  const [introRef, introVisible] = useReveal(0.2);

  const service = site.services.find((s) => s.id === slug);
  const detail = serviceDetails[slug];

  if (!service || !detail) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="service-detail">
      <div
        className="service-detail-banner"
        style={{ backgroundImage: `url(${detail.banner})` }}
      >
        <div className="service-detail-banner-scrim" />
        <div className="container">
          <span className="eyebrow">Our Services</span>
          <h1>{service.title}</h1>
        </div>
      </div>

      <div className="container">
        <div
          ref={introRef}
          className={`service-detail-intro ${introVisible ? "is-in" : ""}`}
        >
          <p>{detail.intro}</p>
        </div>

        <div className="service-detail-body">
          <div className="service-detail-sections">
            {detail.sections.map((section) => (
              <div key={section.title} className="service-detail-section">
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </div>
            ))}
          </div>

          <aside className="service-detail-highlights">
            <h3>What you get</h3>
            <ul>
              {detail.highlights.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <button
              type="button"
              className="btn btn-primary service-detail-inline-cta"
              onClick={() => setEnquireOpen(true)}
            >
              Enquire Now
            </button>
          </aside>
        </div>

        <div className="service-detail-back">
          <Link to="/#services">&larr; Back to all services</Link>
        </div>
      </div>

      <StickyEnquireBar onOpen={() => setEnquireOpen(true)} />
      <ServiceEnquiryModal
        open={enquireOpen}
        onClose={() => setEnquireOpen(false)}
        serviceSlug={service.id}
        serviceTitle={service.title}
      />
    </div>
  );
}
