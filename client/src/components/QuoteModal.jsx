import { useEffect, useState } from "react";
import { submitQuote } from "../api/client";
import "./QuoteModal.css";

const initialForm = {
  name: "",
  company: "",
  contact: "",
  email: "",
  origin: "",
  destination: "",
  weight: "",
};

export default function QuoteModal({ open, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setStatus("idle");
      setForm(initialForm);
    }
  }, [open]);

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await submitQuote(form);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div
      className={`quote-modal-overlay ${open ? "is-open" : ""}`}
      onClick={onClose}
      aria-hidden={!open}
    >
      <div
        className={`quote-modal ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Get a quote"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="quote-modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        {status === "success" ? (
          <div className="quote-modal-success">
            <h3>Request received</h3>
            <p>
              Thanks &mdash; our team will reach out shortly to confirm your
              shipment details.
            </p>
            <button className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <>
            <h3>Get a Quote</h3>
            <p className="quote-modal-sub">
              Best transport, supply chain and warehousing support &mdash;
              tell us what you're moving.
            </p>
            <form onSubmit={submit} className="quote-modal-form">
              <div className="quote-modal-row">
                <input
                  placeholder="Name *"
                  required
                  value={form.name}
                  onChange={update("name")}
                />
                <input
                  placeholder="Company Name *"
                  required
                  value={form.company}
                  onChange={update("company")}
                />
              </div>
              <div className="quote-modal-row">
                <input
                  placeholder="Contact Number *"
                  required
                  value={form.contact}
                  onChange={update("contact")}
                />
                <input
                  type="email"
                  placeholder="Email *"
                  required
                  value={form.email}
                  onChange={update("email")}
                />
              </div>
              <div className="quote-modal-row">
                <input
                  placeholder="Origin *"
                  required
                  value={form.origin}
                  onChange={update("origin")}
                />
                <input
                  placeholder="Destination *"
                  required
                  value={form.destination}
                  onChange={update("destination")}
                />
              </div>
              <input
                placeholder="Weight *"
                required
                value={form.weight}
                onChange={update("weight")}
              />

              <button
                className="btn btn-primary quote-modal-submit"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Sending..." : "Connect With Experts"}
              </button>
              {status === "error" && (
                <p className="quote-modal-error">
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
