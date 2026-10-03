import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import Hero from "../components/Hero";
import Stats from "../components/Stats";
import About from "../components/About";
import Services from "../components/Services";
import WhyUs from "../components/WhyUs";
import Testimonials from "../components/Testimonials";
import Sectors from "../components/Sectors";
import Newsletter from "../components/Newsletter";

export default function Home({ onOpenQuote }) {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash || location.hash === "#") return;

    const el = document.querySelector(location.hash);

    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, [location.hash]);

  return (
    <>
      {/* Opening composition */}
      <Hero onOpenQuote={onOpenQuote} />
      <Stats />

      {/* Main landing-page content */}
      <About />
      <Services />
      <WhyUs />
      <Testimonials />
      <Sectors />
      <Newsletter />
    </>
  );
}