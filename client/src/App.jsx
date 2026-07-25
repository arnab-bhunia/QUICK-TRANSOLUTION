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
import ChatBot from "./components/ChatBot";
import { useMeasuredHeight } from "./hooks/useMeasuredHeight";

function App() {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Measures the real height of the sticky topbar+navbar stack (which
  // changes when the topbar wraps on narrow screens) so Hero.css can
  // size itself to exactly "the rest of the screen" via
  // calc(100dvh - var(--header-height)) instead of guessing a fixed
  // pixel number that breaks on different devices.
  const headerRef = useMeasuredHeight("--header-height");

  return (
    <>
      <div ref={headerRef}>
        <TopBar />
        <Navbar onOpenQuote={() => setQuoteOpen(true)} />
      </div>
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
      <StickyContact
        onOpenQuote={() => setQuoteOpen(true)}
        onToggleChat={() => setChatOpen((v) => !v)}
        chatOpen={chatOpen}
      />
      <ChatBot open={chatOpen} onClose={() => setChatOpen(false)} />
      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} />
    </>
  );
}

export default App;