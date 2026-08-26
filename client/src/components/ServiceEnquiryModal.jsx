import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { submitServiceEnquiry } from "../api/client";
import { useAlert } from "../context/AlertContext";
import { useClientAuth } from "../context/ClientAuthContext";
import "./ServiceEnquiryModal.css";

// Hard client-side caps mirrored (and re-enforced) on the server. These
// exist for two reasons: a normal person's details are never anywhere
// close to these lengths, and capping input size is itself a basic
// security measure against oversized/abusive payloads before the request
// ever reaches the server's own validation.
const LIMITS = {
  name: 100,
  phone: 20,
  email: 254,
  address: 300,
  message: 1500, // ~300 words
};

const initialForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  message: "",
  acceptTerms: false,
};

function wordCount(text) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export default function ServiceEnquiryModal({
  open,
  onClose,
  serviceSlug,
  serviceTitle,
}) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const alert = useAlert();
  const { customer } = useClientAuth();

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

  const update = (field) => (e) => {
    const raw = e.target.value;
    const capped =
      typeof LIMITS[field] === "number" ? raw.slice(0, LIMITS[field]) : raw;
    setForm((f) => ({ ...f, [field]: capped }));
  };

  const messageWords = useMemo(() => wordCount(form.message), [form.message]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.acceptTerms) {
      alert.error("Please accept the Privacy Policy and Terms of Service.");
      return;
    }

    setStatus("loading");
    try {
      await submitServiceEnquiry({
        serviceSlug,
        serviceTitle,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        message: form.message.trim(),
        acceptedPrivacyPolicy: true,
        acceptedTermsOfService: true,
      });
      setStatus("success");
      alert.success("Enquiry received — our team will reach out shortly.");
    } catch (err) {
      setStatus("idle");
      alert.error(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div
      className={`enquiry-modal-overlay ${open ? "is-open" : ""}`}
      onClick={onClose}
      aria-hidden={!open}
    >
      <div
        className={`enquiry-modal ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={`Enquire about ${serviceTitle || "this service"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="enquiry-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        {status === "success" ? (
          <div className="enquiry-modal-success">
            <h3>Enquiry received</h3>
            <p>
              Thanks &mdash; our team will get back to you shortly about{" "}
              <strong>{serviceTitle}</strong>.
            </p>
            <button className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <>
            {/*
              Same modal for everyone — no auto-filled/read-only fields for
              logged-in customers, everyone types their own details. This
              link is just a shortcut for people who'd rather manage their
              enquiry from their account afterwards; it doesn't change the
              form below at all.
            */}
            {!customer && (
              <div className="enquiry-modal-auth-hint">
                <span>Already have an account?</span>
                <Link to="/login" onClick={onClose}>
                  Sign in
                </Link>
                <span>or</span>
                <Link to="/signup" onClick={onClose}>
                  Create one
                </Link>
              </div>
            )}

            <h3>Enquire Now</h3>
            <p className="enquiry-modal-sub">
              {serviceTitle
                ? `Tell us a bit about your requirement for ${serviceTitle}.`
                : "Tell us a bit about your requirement."}
            </p>

            <form onSubmit={submit} className="enquiry-modal-form">
              <div className="enquiry-modal-row">
                <input
                  placeholder="Full Name *"
                  required
                  maxLength={LIMITS.name}
                  value={form.name}
                  onChange={update("name")}
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  required
                  maxLength={LIMITS.phone}
                  value={form.phone}
                  onChange={update("phone")}
                />
              </div>

              <input
                type="email"
                placeholder="Email Address *"
                required
                maxLength={LIMITS.email}
                value={form.email}
                onChange={update("email")}
              />

              <input
                placeholder="Address *"
                required
                maxLength={LIMITS.address}
                value={form.address}
                onChange={update("address")}
              />

              <div className="enquiry-modal-textarea-wrap">
                <textarea
                  placeholder="Describe your requirement *"
                  required
                  rows={4}
                  maxLength={LIMITS.message}
                  value={form.message}
                  onChange={update("message")}
                />
                <span className="enquiry-modal-counter">
                  {messageWords} / 300 words
                </span>
              </div>

              <label className="enquiry-modal-consent">
                <input
                  type="checkbox"
                  checked={form.acceptTerms}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, acceptTerms: e.target.checked }))
                  }
                  required
                />
                <span>
                  I agree to the{" "}
                  <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link to="/terms-conditions" target="_blank" rel="noopener noreferrer">
                    Terms of Service
                  </Link>
                  .
                </span>
              </label>

              <button
                className="btn btn-primary enquiry-modal-submit"
                disabled={status === "loading" || !form.acceptTerms}
              >
                {status === "loading" ? "Sending..." : "Enquire Now"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
