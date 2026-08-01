import { useState } from "react";
import { site } from "../config/site";
import { useReveal } from "../hooks/useReveal";
import {
  NetworkIcon,
  ShieldIcon,
  TrackingIcon,
  PackageIcon,
  DocumentIcon,
} from "../assets/promotionsIcon";
import "./WhyUs.css";

const whyUsIcons = [NetworkIcon, ShieldIcon, TrackingIcon, PackageIcon, DocumentIcon];

export default function WhyUs() {
  const [active, setActive] = useState(0);
  const [ref, visible] = useReveal(0.2);
  const current = site.whyUs[active] ?? site.whyUs[0];

  return (
    <section id="why-us" className="section why-us">
      <div className="why-us-banner">
        <div className="container">
          <div className={`section-head ${visible ? "is-in" : ""}`}>
            <span className="eyebrow">Why Choose Us</span>
            <h2>Single-window logistics, tailor-made for you</h2>
            <p>
              The Quick Transolution Pvt. Ltd. offers single-window solutions for multimodal
              transport by air, rail, sea and land, backed by integrated
              technology and end-to-end infrastructure.
            </p>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Tablet / desktop: tab list on the left, shared content panel on the right */}
        <div ref={ref} className="why-us-reveal">
          <div className={`why-us-panel ${visible ? "is-in" : ""}`}>
            <div className="why-us-tabs" role="tablist" aria-orientation="vertical">
              {site.whyUs.map((item, i) => {
                const Icon = whyUsIcons[i];
                return (
                  <button
                    key={item.id}
                    role="tab"
                    aria-selected={active === i}
                    className={`why-us-tab ${active === i ? "is-active" : ""}`}
                    onClick={() => setActive(i)}
                  >
                    <span className="why-us-tab-icon">
                      {Icon && <Icon />}
                    </span>
                    <span className="why-us-tab-label">{item.title}</span>
                  </button>
                );
              })}
            </div>

            <div className="why-us-content" key={current.id}>
              <h3>{current.title}</h3>
              <p>{current.body}</p>
              <a href="#contact" className="btn btn-outline">
                Enquire Now
              </a>
            </div>
          </div>

          {/* Mobile only: accordion grid — tap a title, its answer opens right below it */}
          <div className={`why-us-accordion ${visible ? "is-in" : ""}`}>
            {site.whyUs.map((item, i) => {
              const isOpen = active === i;
              const Icon = whyUsIcons[i];
              return (
                <div
                  key={item.id}
                  className={`why-us-acc-item ${isOpen ? "is-open" : ""}`}
                >
                  <button
                    className="why-us-acc-head"
                    aria-expanded={isOpen}
                    onClick={() => setActive(isOpen ? -1 : i)}
                  >
                    <span className="why-us-tab-icon">
                      {Icon && <Icon />}
                    </span>
                    <span className="why-us-tab-label">{item.title}</span>
                    <span className="why-us-acc-chevron" aria-hidden="true" />
                  </button>

<div className="why-us-acc-body-wrap">
  <div className="why-us-acc-body">
    <div className="why-us-acc-body-inner">
      <p>{item.body}</p>
      <a href="#contact" className="btn btn-outline">
        Enquire Now
      </a>
    </div>
  </div>
</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}