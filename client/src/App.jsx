import { useState } from "react";
import TopBar from "./components/TopBar";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import Services from "./components/Services";
import WhyUs from "./components/WhyUs";
import Testimonials from "./components/Testimonials";
import Sectors from "./components/Sectors";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";
import QuoteModal from "./components/QuoteModal";
import StickyContact from "./components/StickyContact";

function App() {
  const [quoteOpen, setQuoteOpen] = useState(false);

  return (
    <>
      <TopBar />
      <Navbar onOpenQuote={() => setQuoteOpen(true)} />
      <main>
        <Hero onOpenQuote={() => setQuoteOpen(true)} />
        <Stats />
        <Services />
        <WhyUs />
        <Testimonials />
        <Sectors />
        <Newsletter />
      </main>
      <Footer />
      <StickyContact onOpenQuote={() => setQuoteOpen(true)} />
      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} />
    </>
  );
}

export default App;
