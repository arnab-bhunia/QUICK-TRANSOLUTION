import { useState } from "react";
import { site } from "../config/site";
import { useReveal } from "../hooks/useReveal";
import { subscribeNewsletter } from "../api/client";
import { useAlert } from "../context/AlertContext";
import "./Newsletter.css";

export default function Newsletter() {
  const [ref, visible] = useReveal(0.3);
  const [form, setForm] = useState({ name: "", email: "", mobile: "" });
  const [status, setStatus] = useState("idle"); // idle | loading — only drives the button now
  const alert = useAlert();

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await subscribeNewsletter(form);
      setForm({ name: "", email: "", mobile: "" });
      alert.success("Subscribed — welcome aboard.");
    } catch (err) {
      alert.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setStatus("idle");
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
        </form>
      </div>
    </section>
  );
}