import { useState, useLayoutEffect } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import TopBar from "../components/TopBar";
import Navbar from "../components/Navbar";
import SecurityMarquee from "../components/SecurityMarquee";
import Footer from "../components/Footer";
import QuoteModal from "../components/QuoteModal";
import StickyContact from "../components/StickyContact";
import ChatBot from "../components/ChatBot";
import Home from "../pages/Home";
import TrackPage from "../pages/TrackPage";
import ServiceDetailPage from "../pages/ServiceDetailPage";
import Blogs from "../pages/Blogs";
import BlogDetails from "../pages/BlogDetails";
import ClientLogin from "../pages/ClientLogin";
import ClientSignup from "../pages/ClientSignup";
import ClientVerifyOtp from "../pages/ClientVerifyOtp";
import ClientDashboard from "../pages/ClientDashboard";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TermsConditions from "../pages/TermsConditions";
import Disclaimer from "../pages/Disclaimer";
import FAQPage from "../pages/FAQPage";
import CookieConsentBanner from "../components/CookieConsentBanner";
import { useMeasuredHeight } from "../hooks/useMeasuredHeight";
import CompanyProfile from "../pages/CompanyProfile";

// Site chrome (TopBar/Navbar/SecurityMarquee/Footer) for every public
// page EXCEPT the client login/signup/verify-email screens, which use
// BareChrome below instead — a standalone auth screen with no site
// header/footer around it.
//
// A dedicated component (rather than a plain `{show && <div>...}` inside
// SiteLayout's own JSX) matters here: useMeasuredHeight's ResizeObserver/
// resize-listener cleanup only runs when the component that CALLED the
// hook unmounts. Nesting this in its own <Route element> means React
// Router genuinely mounts/unmounts MainChrome as the route group
// changes, so that cleanup fires correctly every time — a plain
// conditional inside one always-mounted component would leave a stale
// observer attached to a removed DOM node instead.
function MainChrome({ onOpenQuote }) {
  const headerRef = useMeasuredHeight("--header-height");
  const navbarRef = useMeasuredHeight("--navbar-height");

  return (
    <>
      <div ref={headerRef}>
        <TopBar />
        <div ref={navbarRef}>
          <Navbar onOpenQuote={onOpenQuote} />
        </div>
        <SecurityMarquee />
      </div>
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

// No TopBar/Navbar/Footer — just the page itself. Also resets
// --header-height to 0 so ClientAuth.css's
// `calc(100vh - var(--header-height))` (written assuming a header sits
// above it) still fills the full viewport height here, where there's no
// header taking up any space. MainChrome's own useMeasuredHeight call
// sets the CSS var back to the real header height the next time it
// mounts, so this reset never leaks into other pages.
function BareChrome() {
  useLayoutEffect(() => {
    document.documentElement.style.setProperty("--header-height", "0px");
  }, []);

  return (
    <main>
      <Outlet />
    </main>
  );
}

export default function SiteLayout() {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <Routes>
        <Route element={<MainChrome onOpenQuote={() => setQuoteOpen(true)} />}>
          <Route path="/" element={<Home onOpenQuote={() => setQuoteOpen(true)} />} />
          <Route path="/company-profile" element={<CompanyProfile onOpenQuote={() => setQuoteOpen(true)} />}/>
          <Route path="/track" element={<TrackPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:slug" element={<BlogDetails />} />
          <Route path="/dashboard" element={<ClientDashboard />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/faqs" element={<FAQPage />} />
        </Route>

        <Route element={<BareChrome />}>
          <Route path="/login" element={<ClientLogin />} />
          <Route path="/signup" element={<ClientSignup />} />
          <Route path="/verify-email" element={<ClientVerifyOtp />} />
        </Route>
      </Routes>

      <StickyContact
        onOpenQuote={() => setQuoteOpen(true)}
        onToggleChat={() => setChatOpen((v) => !v)}
        chatOpen={chatOpen}
      />
      <ChatBot open={chatOpen} onClose={() => setChatOpen(false)} />
      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} />
      <CookieConsentBanner />
    </>
  );
}