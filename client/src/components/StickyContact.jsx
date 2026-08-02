import { site } from "../config/site";
import "./StickyContact.css";
import { Link } from "react-router-dom";

export default function StickyContact({ onOpenQuote, onToggleChat, chatOpen }) {
  return (
    <div className="sticky-contact">
      <a
        href={site.contact.phoneHref}
        className="sticky-contact-btn"
        aria-label="Call us"
      >
        <PhoneIcon />
        <span className="sticky-contact-tip">{site.contact.phoneDisplay}</span>
      </a>
      <Link to="/track" className="sticky-contact-btn" aria-label="Track shipment">
        <TrackIcon />
        <span className="sticky-contact-tip">Track Shipment</span>
      </Link>
      <button
        className="sticky-contact-btn"
        onClick={onOpenQuote}
        aria-label="Get a quote"
      >
        <QuoteIcon />
        <span className="sticky-contact-tip">Get a Quote</span>
      </button>
      <button
        className={`sticky-contact-btn sticky-contact-btn--chat ${chatOpen ? "is-active" : ""}`}
        onClick={onToggleChat}
        aria-label={chatOpen ? "Close chat" : "Chat with us"}
      >
        <ChatIcon />
        <span className="sticky-contact-tip">{chatOpen ? "Close Chat" : "Chat with Us"}</span>
      </button>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function TrackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
      <circle cx="7.5" cy="18.5" r="1.6" />
      <circle cx="17.5" cy="18.5" r="1.6" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}
