import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { site } from "../config/site";
import TransportScene from "./TransportScene";
import SmartLink from "./SmartLink";
import { useClientAuth } from "../context/ClientAuthContext";
import "./Hero.css";

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const { customer } = useClientAuth();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120);

    return () => clearTimeout(t);
  }, []);

  // Logged-in customers go straight to their account/dashboard.
  // Everyone else is sent to login first.
  const handleBookShipment = () => {
    navigate(customer ? "/dashboard" : "/login");
  };

  return (
    <section id="home" className="hero">
      {/* Transport visual */}
      <div className="hero-scene-bg" aria-hidden="true">
        <TransportScene active={mounted} />
      </div>

      {/* Mobile-only decorative background */}
      <div className="hero-mobile-bg" aria-hidden="true" />

      {/* Text/content layer */}
      <div className="container hero-inner">
        <div className={`hero-copy ${mounted ? "is-in" : ""}`}>
          <span className="eyebrow">{site.hero.eyebrow}</span>

          <h1 className="hero-heading">
            <span className="hero-heading-line">
              Delivering{" "}
              <span className="hero-heading-accent">Trust</span>
            </span>

            <span className="hero-heading-line">
              Across the Region
            </span>
          </h1>

          <p className="hero-body">{site.hero.body}</p>

          <div className="hero-ctas">
            <SmartLink
              href={site.hero.secondaryCta.href}
              className="btn btn-outline"
            >
              {site.hero.secondaryCta.label}
            </SmartLink>

            <button
              type="button"
              className="hero-book-link"
              onClick={handleBookShipment}
            >
              Book a Shipment
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
