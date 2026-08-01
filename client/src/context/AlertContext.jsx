// ============================================================================
// ALERT CONTEXT
// Single source of truth for every success / error / info message on the
// site. Mounted once in main.jsx via <AlertProvider>. Any component calls
// useAlert() and fires alert.success("...") / alert.error("...") — no more
// per-component status text or per-component CSS.
// ============================================================================
import { createContext, useCallback, useContext, useRef, useState } from "react";
import "./AlertContext.css";

const AlertContext = createContext(null);

const DEFAULT_DURATION = 4500;

const ICONS = {
  success: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7.5v5.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="12" cy="16.3" r="1.1" fill="currentColor" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2" />
      <path d="M12 11v5.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="12" cy="7.6" r="1.1" fill="currentColor" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path
        d="M10.6 3.9L2.9 18.1c-.5.9.1 2 1.1 2h16c1 0 1.6-1.1 1.1-2L13.4 3.9c-.5-.9-1.8-.9-2.3 0z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 9.5v4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="12" cy="16.3" r="1.1" fill="currentColor" />
    </svg>
  ),
};

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const timers = useRef({});
  const idRef = useRef(0);

  const remove = useCallback((id) => {
    window.clearTimeout(timers.current[id]);
    delete timers.current[id];
    // Flag as leaving first so the exit animation can play, then drop it
    // from state once the animation has had time to finish.
    setAlerts((list) => list.map((a) => (a.id === id ? { ...a, leaving: true } : a)));
    window.setTimeout(() => {
      setAlerts((list) => list.filter((a) => a.id !== id));
    }, 220);
  }, []);

  const notify = useCallback(
    (type, message, opts = {}) => {
      const id = ++idRef.current;
      const duration = opts.duration ?? DEFAULT_DURATION;
      setAlerts((list) => [...list, { id, type, message, leaving: false }]);
      if (duration > 0) {
        timers.current[id] = window.setTimeout(() => remove(id), duration);
      }
      return id;
    },
    [remove]
  );

  const pause = useCallback((id) => window.clearTimeout(timers.current[id]), []);
  const resume = useCallback(
    (id, duration = DEFAULT_DURATION) => {
      timers.current[id] = window.setTimeout(() => remove(id), duration);
    },
    [remove]
  );

  const api = {
    notify,
    success: (message, opts) => notify("success", message, opts),
    error: (message, opts) => notify("error", message, opts),
    info: (message, opts) => notify("info", message, opts),
    warning: (message, opts) => notify("warning", message, opts),
    remove,
  };

  return (
    <AlertContext.Provider value={api}>
      {children}

      <div className="alert-container" aria-live="polite" aria-atomic="true">
        {alerts.map((a) => (
          <div
            key={a.id}
            className={`alert-item alert-${a.type} ${a.leaving ? "is-leaving" : ""}`}
            role={a.type === "error" ? "alert" : "status"}
            onMouseEnter={() => pause(a.id)}
            onMouseLeave={() => resume(a.id)}
          >
            <span className="alert-icon">{ICONS[a.type] ?? ICONS.info}</span>
            <p className="alert-message">{a.message}</p>
            <button className="alert-close" aria-label="Dismiss" onClick={() => remove(a.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
}

// Usage anywhere in the tree:
//   const alert = useAlert();
//   alert.success("Subscribed — welcome aboard.");
//   alert.error("Something went wrong. Please try again.");
export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error("useAlert must be used within an <AlertProvider>");
  }
  return ctx;
}