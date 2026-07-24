import { useState } from "react";
import { site } from "../config/site";
import { useReveal } from "../hooks/useReveal";
import { subscribeNewsletter } from "../api/client";
import "./Newsletter.css";

export default function Newsletter() {
  const [ref, visible] = useReveal(0.3);
  const [form, setForm] = useState({ name: "", email: "", mobile: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await subscribeNewsletter(form);
      setStatus("success");
      setForm({ name: "", email: "", mobile: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="newsletter">
      <div
        className={`container newsletter-inner ${visible ? "is-in" : ""}`}
        ref={ref}
      >
        <div className="newsletter-copy">
          <span className="eyebrow">Stay Connected</span>
          <h2>Get updates on transport, exports & industry changes</h2>
          <p>
            Subscribe for shipment updates, documentation changes, and new
            services from {site.companyName}.
          </p>
        </div>

        <form className="newsletter-form" onSubmit={submit}>
          <div className="newsletter-fields">
            <input
              type="text"
              placeholder="Full name"
              required
              value={form.name}
              onChange={update("name")}
            />
            <input
              type="email"
              placeholder="Email address"
              required
              value={form.email}
              onChange={update("email")}
            />
            <input
              type="tel"
              placeholder="Mobile number"
              required
              value={form.mobile}
              onChange={update("mobile")}
            />
          </div>
          <button
            className="btn btn-primary newsletter-submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Submitting..." : "Subscribe"}
          </button>
          {status === "success" && (
            <p className="newsletter-status is-success">
              Subscribed &mdash; welcome aboard.
            </p>
          )}
          {status === "error" && (
            <p className="newsletter-status is-error">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
