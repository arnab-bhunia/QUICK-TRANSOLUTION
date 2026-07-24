import { useEffect, useState } from "react";
import { site } from "../config/site";
import RouteMap from "./RouteMap";
import "./Hero.css";

export default function Hero({ onOpenQuote }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <section id="home" className="hero">
      <div className="container hero-inner">
        <div className={`hero-copy ${mounted ? "is-in" : ""}`}>
          <span className="eyebrow">{site.hero.eyebrow}</span>
          <h1 className="hero-heading">
            {site.hero.heading.split("\n").map((line, i) => (
              <span key={i} className="hero-heading-line">
                {line}
              </span>
            ))}
          </h1>
          <p className="hero-body">{site.hero.body}</p>
          <div className="hero-ctas">
            <button className="btn btn-primary" onClick={onOpenQuote}>
              {site.hero.primaryCta.label}
            </button>
            <a href={site.hero.secondaryCta.href} className="btn btn-outline">
              {site.hero.secondaryCta.label}
            </a>
          </div>
        </div>

        <div className={`hero-visual ${mounted ? "is-in" : ""}`}>
          <RouteMap active={mounted} />
        </div>
      </div>
    </section>
  );
}
