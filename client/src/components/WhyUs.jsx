import { useState } from "react";
import { site } from "../config/site";
import { useReveal } from "../hooks/useReveal";
import "./WhyUs.css";

export default function WhyUs() {
  const [active, setActive] = useState(0);
  const [ref, visible] = useReveal(0.2);
  const current = site.whyUs[active];

  return (
    <section id="why-us" className="section why-us">
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

        <div ref={ref} className={`why-us-panel ${visible ? "is-in" : ""}`}>
          <div className="why-us-tabs" role="tablist" aria-orientation="vertical">
            {site.whyUs.map((item, i) => (
              <button
                key={item.id}
                role="tab"
                aria-selected={active === i}
                className={`why-us-tab ${active === i ? "is-active" : ""}`}
                onClick={() => setActive(i)}
              >
                <span className="why-us-tab-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="why-us-tab-label">{item.title}</span>
              </button>
            ))}
          </div>

          <div className="why-us-content" key={current.id}>
            <h3>{current.title}</h3>
            <p>{current.body}</p>
            <a href="#contact" className="btn btn-outline">
              Enquire Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
