import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Services from "../components/Services";
import WhyUs from "../components/WhyUs";
import Testimonials from "../components/Testimonials";
import Sectors from "../components/Sectors";
import Newsletter from "../components/Newsletter";
import About from "../components/About";

export default function Home({ onOpenQuote }) {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash || location.hash === "#") return;
    const el = document.querySelector(location.hash);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, [location.hash]);

  return (
    <>
      <Hero onOpenQuote={onOpenQuote} />
      <About />
      <Stats />
      <Services />
      <WhyUs />
      <Testimonials />
      <Sectors />
      <Newsletter />
    </>
  );
}
