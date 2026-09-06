import { useEffect, useState } from "react";
import "./RescheduleModal.css";

// datetime-local inputs have no timezone of their own — the browser
// just gives/takes "wall clock" values in the user's local time. The
// existing Schedule flow (BlogManagement.jsx confirmSchedule) already
// relies on this: it does `new Date(inputValue).toISOString()` to turn
// that local wall-clock string into the UTC instant sent to the
// backend. This helper does the same conversion in reverse, so the
// input can be pre-filled with the blog's existing (UTC) scheduledFor
// shown correctly in the user's local time — no second timezone system.
function toDatetimeLocalValue(dateLike) {
  if (!dateLike) return ""; // e.g. new Date(null) is epoch, not "no value"
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  const localMs = d.getTime() - d.getTimezoneOffset() * 60000;
  return new Date(localMs).toISOString().slice(0, 16);
}

// Small modal/dialog for changing a scheduled blog's publication date.
// `blog` is the scheduled post being rescheduled (or null when closed).
export default function RescheduleModal({ blog, saving, apiError, onCancel, onSave }) {
  const [value, setValue] = useState("");
  const [validationError, setValidationError] = useState("");

  // Re-prefill from the blog's current scheduledFor every time a
  // (possibly different) blog is opened for rescheduling.
  useEffect(() => {
    if (blog) {
      setValue(toDatetimeLocalValue(blog.scheduledFor));
      setValidationError("");
    }
  }, [blog]);

  useEffect(() => {
    if (!blog) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !saving) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [blog, saving, onCancel]);

  if (!blog) return null;

  const closeUnlessSaving = () => {
    if (!saving) onCancel();
  };

  const submit = (e) => {
    e.preventDefault();
    if (saving) return; // guard against duplicate submissions

    if (!value) {
      setValidationError("Please pick a date and time.");
      return;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      setValidationError("Please provide a valid date and time.");
      return;
    }
    if (date <= new Date()) {
      setValidationError("The new date must be in the future.");
      return;
    }

    setValidationError("");
    onSave(date.toISOString());
  };

  return (
    <div className="reschedule-modal-overlay" onClick={closeUnlessSaving}>
      <div
        className="reschedule-modal admin-card"
        role="dialog"
        aria-modal="true"
        aria-label="Change Schedule Date"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Change Schedule Date</h3>
        <p className="reschedule-modal-current">
          Current:{" "}
          {blog.scheduledFor ? new Date(blog.scheduledFor).toLocaleString() : "—"}
        </p>

        <form onSubmit={submit}>
          <label className="admin-field">
            <span>New publication date &amp; time</span>
            <input
              type="datetime-local"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={saving}
            />
          </label>

          {(validationError || apiError) && (
            <p className="reschedule-modal-error">{validationError || apiError}</p>
          )}

          <div className="reschedule-modal-actions">
            <button type="button" className="admin-btn" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
