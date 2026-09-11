import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { site } from "../config/site";
import { serviceDetails } from "../config/serviceDetails";
import { companyProfile } from "../config/company";
import { useSeo } from "../hooks/useSeo";
import SmartLink from "../components/SmartLink";
import {
  NetworkIcon,
  ShieldIcon,
  TrackingIcon,
  PackageIcon,
  DocumentIcon,
} from "../assets/promotionsIcon";
import {
  FMCGIcon,
  PharmaIcon,
  AutomotiveIcon,
  PackagingIcon,
  PublishingIcon,
  InfrastructureIcon,
  EngineeringIcon,
  TelecomIcon,
} from "../assets/industryIcon";
import "./CompanyProfile.css";

const whyUsIcons = {
  network: NetworkIcon,
  trusted: ShieldIcon,
  digital: TrackingIcon,
  "single-window": PackageIcon,
  customs: DocumentIcon,
};

const industryIcons = {
  fmcg: FMCGIcon,
  "pharma-healthcare": PharmaIcon,
  automotive: AutomotiveIcon,
  packaging: PackagingIcon,
  "publishing-media": PublishingIcon,
  infrastructure: InfrastructureIcon,
  engineering: EngineeringIcon,
  telecom: TelecomIcon,
};

/*
 * The detailed, SEO-oriented "who we are / what we do" page. Short
 * summaries of Why Us, Services and Sectors stay owned by config/site.js
 * (and complete service write-ups stay in config/serviceDetails.js) —
 * this page only adds the additional depth that doesn't belong on the
 * concise Home page, sourced from config/company.js and mapped onto the
 * SAME ids Home already uses, so Home's "Read More" / sector / Why Us
 * links land on the right section here.
 */
export default function CompanyProfile({ onOpenQuote }) {
  const location = useLocation();

  // Mirrors Home.jsx's own hash-scroll effect: React Router doesn't
  // auto-scroll to an in-page anchor on route change, refresh, or a
  // direct URL visit the way a full page load would. A short delay lets
  // this page's own content (and any images above the target) settle
  // before we measure where to scroll.
  useEffect(() => {
    if (!location.hash || location.hash === "#") return;
    const t = setTimeout(() => {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 60);
    return () => clearTimeout(t);
  }, [location.hash]);

  const canonicalUrl = `${window.location.origin}${companyProfile.seo.canonical}`;

  useSeo({
    title: companyProfile.seo.title,
    description: companyProfile.seo.description,
    image: companyProfile.seo.ogImage,
    canonicalUrl,
    ogTitle: companyProfile.seo.ogTitle,
    ogDescription: companyProfile.seo.ogDescription,
    ogType: companyProfile.seo.ogType,
  });

  return (
    <div className="company-profile">
      <div className="company-profile-banner">
        <div className="company-profile-banner-scrim" />
        <div className="container">
          <span className="eyebrow">{companyProfile.hero.eyebrow}</span>
          <h1>{companyProfile.hero.heading}</h1>
          <p>{companyProfile.hero.body}</p>
        </div>
      </div>

      <article className="container company-profile-body">
        <section id="about" className="cp-section">
          <h2>{companyProfile.about.heading}</h2>
          {companyProfile.about.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>

        <section id="story" className="cp-section">
          <h2>{companyProfile.story.heading}</h2>
          {companyProfile.story.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>

        <section id="mission-vision" className="cp-section">
          <h2>Mission &amp; Vision</h2>
          <div className="cp-mv-grid">
            <div className="cp-mv-card">
              <h3>{companyProfile.mission.heading}</h3>
              <p>{companyProfile.mission.body}</p>
            </div>
            <div className="cp-mv-card">
              <h3>{companyProfile.vision.heading}</h3>
              <p>{companyProfile.vision.body}</p>
            </div>
          </div>
        </section>

        <section id="why-us" className="cp-section">
          <h2>Why Choose Us</h2>
          <div className="cp-whyus-grid">
            {companyProfile.whyUsDetails.map((detail) => {
              const base = site.whyUs.find((w) => w.id === detail.id);
              const Icon = whyUsIcons[detail.id];
              if (!base) return null;
              return (
                <div key={detail.id} id={detail.id} className="cp-whyus-item">
                  <span className="cp-whyus-icon" aria-hidden="true">
                    {Icon && <Icon />}
                  </span>
                  <h3>{base.title}</h3>
                  {detail.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              );
            })}
          </div>
        </section>

        <section id="our-services" className="cp-section">
          <h2>Our Services</h2>
          <div className="cp-services-grid">
            {companyProfile.services.map((svc) => {
              const base = site.services.find((s) => s.id === svc.id);
              if (!base) return null;
              const hasDetail = Boolean(serviceDetails[svc.id]);
              return (
                <div key={svc.id} className="cp-service-item">
                  <h3>{base.title}</h3>
                  <p>{svc.body}</p>
                  {hasDetail && (
                    <Link to={`/services/${svc.id}`} className="cp-service-link">
                      Click here <span aria-hidden="true">&rarr;</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section id="industries" className="cp-section">
          <h2>Industries We Serve</h2>
          <div className="cp-industries-grid">
            {companyProfile.industries.map((ind) => {
              const Icon = industryIcons[ind.id];
              return (
                <div key={ind.id} id={ind.id} className="cp-industry-item">
                  <span className="cp-industry-icon" aria-hidden="true">
                    {Icon && <Icon />}
                  </span>
                  <h3>{ind.title}</h3>
                  {ind.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              );
            })}
          </div>
        </section>

        <section id="how-we-work" className="cp-section">
          <h2>{companyProfile.howWeWork.heading}</h2>
          <ol className="cp-howwework-list">
            {companyProfile.howWeWork.steps.map((step, i) => (
              <li key={step.title}>
                <span className="cp-howwework-index" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="technology" className="cp-section">
          <h2>{companyProfile.technology.heading}</h2>
          {companyProfile.technology.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
      </article>

      <section id="cta" className="cp-cta">
        <div className="container cp-cta-inner">
          <h2>{companyProfile.cta.heading}</h2>
          <p>{companyProfile.cta.body}</p>
          <div className="cp-cta-actions">
            <button type="button" className="btn btn-primary" onClick={onOpenQuote}>
              {companyProfile.cta.primaryCta.label}
            </button>
            <SmartLink href={companyProfile.cta.secondaryCta.href} className="btn btn-outline">
              {companyProfile.cta.secondaryCta.label}
            </SmartLink>
          </div>
        </div>
      </section>
    </div>
  );
}
