import { useState } from "react";
import { trackShipment } from "../api/client";
import { useAlert } from "../context/AlertContext";
import "./TrackPage.css";
import { site } from "../config/site";
import FaqAccordion from "../components/FaqAccordion";

const STATUS_LABELS = {
  booked: "Booked",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  on_hold: "On Hold",
};

export default function TrackPage() {
  const alert = useAlert();

  const [trackingId, setTrackingId] = useState("");
  const [phoneLast4, setPhoneLast4] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setStatus("loading");
    try {
      // TODO: once reCAPTCHA v3 is wired up, generate a token here and
      // include it in the payload — backend will verify it server-side
      // before this request is processed.
      const data = await trackShipment({
        trackingId: trackingId.trim().toUpperCase(),
        ...(needsVerification ? { phoneLast4: phoneLast4.trim() } : {}),
      });
      setResult(data);
    } catch (err) {
      if (err.data?.needsVerification) {
        setNeedsVerification(true);
        setResult(null);
        alert.info("This shipment is private. Enter the receiver's phone number's last 4 digits to continue.");
      } else {
        setResult(null);
        alert.error(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setStatus("idle");
    }
  };

  const timelineOrder = ["booked", "picked_up", "in_transit", "out_for_delivery", "delivered"];
  const currentStepIndex = result ? timelineOrder.indexOf(result.currentStatus) : -1;

  return (
    <>
      <section className="section track-banner">
        <div className="container">
          <div className="section-head is-in track-banner-head">
            <span className="eyebrow">Track Shipment</span>
            <h1>Track your parcel in <span className="header-span">Real Time</span></h1>
            <p>
              Enter your tracking ID below to see the current status, last known
              location, and full movement history for your shipment.
            </p>
          </div>
        </div>
      </section>

      <section className="section track-form-section">
        <div className="container track-form-inner">
          <form className="track-form" onSubmit={submit}>
            <label className="track-field">
  <span>Tracking ID</span>

  <input
    type="text"
    placeholder="e.g. QT7K2M9XPL"
    required
    value={trackingId}
    onChange={(e) => setTrackingId(e.target.value)}
    autoComplete="off"
  />

  <span className="track-field__icon" aria-hidden="true">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="16.65" y1="16.65" x2="21" y2="21" />
    </svg>
  </span>
</label>

            {needsVerification && (
              <label className="track-field">
                <span>Receiver's phone — last 4 digits</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="e.g. 4821"
                  required
                  value={phoneLast4}
                  onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, ""))}
                  autoComplete="off"
                />
              </label>
            )}

            <button className="btn btn-primary track-submit" disabled={status === "loading"}>
              {status === "loading" ? "Tracking..." : "Track Shipment"}
            </button>

            <p className="track-form-note">
              Protected against automated abuse by reCAPTCHA. This site is protected by
              reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
            </p>
          </form>

          {result && (
            <div className="track-result">
              <div className="track-result-summary">
                <div>
                  <span className="track-result-label">Tracking ID</span>
                  <span className="track-result-value">{result.trackingId}</span>
                </div>
                <div>
                  <span className="track-result-label">Route</span>
                  <span className="track-result-value">
                    {result.origin} → {result.destination}
                  </span>
                </div>
                {result.estimatedDelivery && (
                  <div>
                    <span className="track-result-label">Estimated Delivery</span>
                    <span className="track-result-value">
                      {new Date(result.estimatedDelivery).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <ol className="track-timeline">
                {timelineOrder.map((step, i) => {
                  const historyEntry = result.history?.find((h) => h.status === step);
                  const isDone = i <= currentStepIndex;
                  return (
                    <li
                      key={step}
                      className={`track-timeline-step ${isDone ? "is-done" : ""} ${
                        i === currentStepIndex ? "is-current" : ""
                      }`}
                    >
                      <span className="track-timeline-dot" />
                      <div>
                        <h4>{STATUS_LABELS[step]}</h4>
                        {historyEntry && (
                          <p>
                            {historyEntry.location} —{" "}
                            {new Date(historyEntry.timestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>
      </section>

      <section className="section track-steps">
        <div className="container">
          <ol className="track-steps-list">
{site.track.steps.map((step, i) => (
  <li key={step.title} className="track-step">
    <div className="track-step-top">
      <span className="track-step-num">{i + 1}</span>
      <h3>{step.title}</h3>
    </div>
    <p>{step.body}</p>
  </li>
))}
          </ol>
        </div>
      </section>

<section className="section track-info">
  <div className="container track-info-grid">
    <div className="track-info-card">
      <h2>Important Information</h2>
      <ul className="track-info-list">
        {site.track.importantInfo.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>

    <div className="track-info-card track-info-card--security">
      <h2>Security Notice</h2>
      <ul className="track-info-list">
        {site.track.securityNotice.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  </div>
</section>

<section className="section track-faq">
  <div className="container">
    <div className="section-head is-in">
      <span className="eyebrow">FAQs</span>
      <h2>Frequently Asked <span className="header-span">Questions</span></h2>
    </div>
    <FaqAccordion items={site.track.faqs} />
  </div>
</section>

<section className="section track-help">
  <div className="container track-help-inner">
    <h2>Need Assistance?</h2>
    <p>{site.track.needHelp}</p>
    <a href="#contact" className="btn btn-primary">
      Contact Support
    </a>
  </div>
</section>


    </>
  );
}
