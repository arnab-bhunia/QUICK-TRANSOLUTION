import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import TopBar from "./components/TopBar";
import Navbar from "./components/Navbar";
import SecurityMarquee from "./components/SecurityMarquee";
import Footer from "./components/Footer";
import QuoteModal from "./components/QuoteModal";
import StickyContact from "./components/StickyContact";
import ChatBot from "./components/ChatBot";
import Home from "./pages/Home";
import TrackPage from "./pages/TrackPage";
import { useMeasuredHeight } from "./hooks/useMeasuredHeight";

function App() {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const headerRef = useMeasuredHeight("--header-height");
  const navbarRef = useMeasuredHeight("--navbar-height");

  return (
    <>
      <div ref={headerRef}>
        <TopBar />
        <div ref={navbarRef}>
          <Navbar onOpenQuote={() => setQuoteOpen(true)} />
        </div>
        <SecurityMarquee />
      </div>
      <main>
        <Routes>
          <Route path="/" element={<Home onOpenQuote={() => setQuoteOpen(true)} />} />
          <Route path="/track" element={<TrackPage />} />
        </Routes>
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
