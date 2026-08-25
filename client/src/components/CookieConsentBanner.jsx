import { useState } from "react";
import { Link } from "react-router-dom";
import { useCookieConsent } from "../context/CookieConsentContext";
import "./CookieConsentBanner.css";

export default function CookieConsentBanner() {
  const {
    categories,
    hasDecided,
    preferencesOpen,
    closePreferences,
    acceptAll,
    rejectNonEssential,
    saveCustom,
    openPreferences,
  } = useCookieConsent();

  const [draft, setDraft] = useState(categories);

  const openManage = () => {
    setDraft(categories);
    openPreferences();
  };

  return (
    <>
      {!hasDecided && (
        <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
          <div className="cookie-banner-text">
            <p>
              We use cookies to run this site and, with your permission, to understand how it's
              used. See our{" "}
              <Link to="/privacy-policy" target="_blank">
                Privacy Policy
              </Link>{" "}
              for details.
            </p>
          </div>
          <div className="cookie-banner-actions">
            <button className="cookie-btn cookie-btn-ghost" onClick={openManage}>
              Manage Preferences
            </button>
            <button className="cookie-btn cookie-btn-outline" onClick={rejectNonEssential}>
              Only Essential
            </button>
            <button className="cookie-btn cookie-btn-primary" onClick={acceptAll}>
              Accept All
            </button>
          </div>
        </div>
      )}

      {preferencesOpen && (
        <div className="cookie-modal-overlay" onClick={closePreferences}>
          <div className="cookie-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Cookie Preferences</h3>
            <p className="cookie-modal-intro">
              Choose which categories of cookies we're allowed to set. Strictly necessary cookies
              can't be turned off, since the site can't function without them.
            </p>

            <div className="cookie-toggle-row">
              <div>
                <strong>Strictly Necessary</strong>
                <p>Required for login, security, and remembering this preference.</p>
              </div>
              <span className="cookie-toggle cookie-toggle-locked" aria-label="Always on">
                <span className="cookie-toggle-knob" />
              </span>
            </div>

            <div className="cookie-toggle-row">
              <div>
                <strong>Analytics</strong>
                <p>Helps us understand how visitors use the site.</p>
              </div>
              <button
                className={`cookie-toggle ${draft.analytics ? "is-on" : ""}`}
                role="switch"
                aria-checked={draft.analytics}
                onClick={() => setDraft((d) => ({ ...d, analytics: !d.analytics }))}
              >
                <span className="cookie-toggle-knob" />
              </button>
            </div>

            <div className="cookie-toggle-row">
              <div>
                <strong>Marketing</strong>
                <p>Used to measure and improve promotional communications.</p>
              </div>
              <button
                className={`cookie-toggle ${draft.marketing ? "is-on" : ""}`}
                role="switch"
                aria-checked={draft.marketing}
                onClick={() => setDraft((d) => ({ ...d, marketing: !d.marketing }))}
              >
                <span className="cookie-toggle-knob" />
              </button>
            </div>

            <div className="cookie-modal-actions">
              <button className="cookie-btn cookie-btn-outline" onClick={closePreferences}>
                Cancel
              </button>
              <button className="cookie-btn cookie-btn-primary" onClick={() => saveCustom(draft)}>
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
