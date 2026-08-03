import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import TopBar from "../components/TopBar";
import Navbar from "../components/Navbar";
import SecurityMarquee from "../components/SecurityMarquee";
import Footer from "../components/Footer";
import QuoteModal from "../components/QuoteModal";
import StickyContact from "../components/StickyContact";
import ChatBot from "../components/ChatBot";
import Home from "../pages/Home";
import TrackPage from "../pages/TrackPage";
import ClientLogin from "../pages/ClientLogin";
import ClientSignup from "../pages/ClientSignup";
import ClientDashboard from "../pages/ClientDashboard";
import { useMeasuredHeight } from "../hooks/useMeasuredHeight";

// Public-facing site chrome (TopBar/Navbar/Footer/chat/quote modal)
// wrapping every public page. /admin lives in its own separate layout
// (see admin/AdminApp.jsx) — a staff portal has no business showing the
// site's marketing chrome, chat widget, or quote modal.
export default function SiteLayout() {
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
          <Route path="/login" element={<ClientLogin />} />
          <Route path="/signup" element={<ClientSignup />} />
          <Route path="/dashboard" element={<ClientDashboard />} />
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
