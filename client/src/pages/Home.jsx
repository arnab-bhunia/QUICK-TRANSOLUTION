import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Services from "../components/Services";
import WhyUs from "../components/WhyUs";
import Testimonials from "../components/Testimonials";
import Sectors from "../components/Sectors";
import Newsletter from "../components/Newsletter";

export default function Home({ onOpenQuote }) {
  const location = useLocation();

  // Nav links like "#services" work as native browser anchors while
  // already on "/". But arriving here FROM another page (e.g. clicking
  // "Services" while on /track) is a real route change to "/#services" —
  // React Router doesn't auto-scroll on that, since there's no full page
  // reload for the browser to do it natively. This fills that one gap.
  useEffect(() => {
    if (!location.hash || location.hash === "#") return;
    const el = document.querySelector(location.hash);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, [location.hash]);

  return (
    <>
      <Hero onOpenQuote={onOpenQuote} />
      <Stats />
      <Services />
      <WhyUs />
      <Testimonials />
      <Sectors />
      <Newsletter />
    </>
  );
}
