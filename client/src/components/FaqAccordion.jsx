import { useState } from "react";
import "./FaqAccordion.css";

export default function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="faq-accordion">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.question} className={`faq-item ${isOpen ? "is-open" : ""}`}>
            <button
              className="faq-question"
              onClick={() => setOpenIndex(isOpen ? -1 : i)}
              aria-expanded={isOpen}
            >
              <span className="faq-index">{String(i + 1).padStart(2, "0")}</span>
              <span className="faq-question-text">{item.question}</span>
              <span className="faq-chevron" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </button>
            <div className="faq-answer-wrap">
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}