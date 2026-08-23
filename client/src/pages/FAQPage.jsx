import FaqAccordion from "../components/FaqAccordion";
import { generalFaqs } from "../config/legal";
import "./FAQPage.css";

export default function FAQPage() {
  return (
    <section className="section faq-page">
      <div className="container faq-page-inner">
        <span className="eyebrow">Support</span>
        <h1>Frequently Asked Questions</h1>
        <p className="faq-page-intro">
          Answers to the questions we hear most often. Can't find what you need?{" "}
          Reach out via the chat button or our contact details below.
        </p>
        <FaqAccordion items={generalFaqs} />
      </div>
    </section>
  );
}
