import { useEffect, useRef, useState } from "react";
import { chatFallbackPrompt, chatFallbackThanks, chatGreeting } from "../config/faq";
import { matchFaq } from "../utils/matchFaq";
import { submitUnansweredQuery } from "../api/client";
import "./ChatBot.css";

let idCounter = 0;
const nextId = () => `msg-${++idCounter}`;

export default function ChatBot({ open, onClose }) {
  const [messages, setMessages] = useState([
    { id: nextId(), from: "bot", text: chatGreeting },
  ]);
  const [input, setInput] = useState("");
  // "idle" = normal FAQ mode.
  // "awaiting-contact" = we're collecting optional contact info after an
  // unanswered question, before saving it.
  const [mode, setMode] = useState("idle");
  const [pendingQuestion, setPendingQuestion] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  const addMessage = (from, text) =>
    setMessages((m) => [...m, { id: nextId(), from, text }]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    addMessage("user", text);
    setInput("");

    if (mode === "awaiting-contact") {
      setMode("idle");
      try {
        await submitUnansweredQuery({
          question: pendingQuestion,
          contact: text.toLowerCase() === "skip" ? "" : text,
        });
        addMessage("bot", chatFallbackThanks);
      } catch {
        addMessage(
          "bot",
          "Sorry, I couldn't send that just now. Please try the 'Get a Quote' form instead."
        );
      }
      setPendingQuestion(null);
      return;
    }

    const match = matchFaq(text);
    if (match) {
      addMessage("bot", match.answer);
    } else {
      addMessage("bot", chatFallbackPrompt + " (or type 'skip' to leave it blank)");
      setPendingQuestion(text);
      setMode("awaiting-contact");
    }
  };

  return (
    <div
      className={`chatbot-panel ${open ? "is-open" : ""}`}
      role="dialog"
      aria-label="Chat assistant"
      aria-hidden={!open}
    >
      <div className="chatbot-header">
        <div>
          <span>Quick Help</span>
          <span className="chatbot-header-sub">Usually replies instantly</span>
        </div>
        <button className="chatbot-close" onClick={onClose} aria-label="Close chat">
          <CloseIcon />
        </button>
      </div>

      <div className="chatbot-messages" ref={scrollRef}>
        {messages.map((m) => (
          <div key={m.id} className={`chatbot-bubble chatbot-bubble--${m.from}`}>
            {m.text}
          </div>
        ))}
      </div>

      <form className="chatbot-input-row" onSubmit={handleSend}>
        <input
          type="text"
          placeholder={
            mode === "awaiting-contact"
              ? "Email or phone (or type 'skip')"
              : "Ask a question..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" aria-label="Send">
          <SendIcon />
        </button>
      </form>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z" />
    </svg>
  );
}
