import { useEffect, useState } from "react";
import {
  getApplicationAdmin,
  updateApplicationStatusAdmin,
  addApplicationNoteAdmin,
  getApplicationResumeAdmin,
} from "../../../api/client";
import { useAlert } from "../../../context/AlertContext";
import "./CareersPanel.css";

const STATUS_OPTIONS = ["NEW", "REVIEWING", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED", "WITHDRAWN"];

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="careers-drawer-row">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

// Applicant detail drawer — follows the same fetch-on-open / overlay /
// slide-in panel structure as
// admin/pages/serviceEnquiries/EnquiryDetailDrawer.jsx, since the spec
// explicitly asks for this to follow the existing Service Enquiry
// detail UI pattern (section 13).
export default function ApplicationDetailDrawer({ id, onClose, onStatusChanged }) {
  const alert = useAlert();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusSaving, setStatusSaving] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [resumeBusy, setResumeBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    getApplicationAdmin(id)
      .then(setData)
      .catch((err) => alert.error(err.message || "Could not load this application."))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = async (e) => {
    const status = e.target.value;
    setStatusSaving(true);
    try {
      await updateApplicationStatusAdmin(id, status);
      setData((d) => ({ ...d, status }));
      alert.success("Status updated.");
      onStatusChanged?.();
    } catch (err) {
      alert.error(err.message || "Could not update status.");
    } finally {
      setStatusSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setNoteSaving(true);
    try {
      const res = await addApplicationNoteAdmin(id, noteText.trim());
      setData((d) => ({ ...d, internalNotes: res.notes }));
      setNoteText("");
    } catch (err) {
      alert.error(err.message || "Could not add note.");
    } finally {
      setNoteSaving(false);
    }
  };

  // Resume access always mints a fresh, short-lived signed URL for THIS
  // click — never a stored/reusable public link (spec section 13/16).
  const handleResume = async (mode) => {
    setResumeBusy(true);
    try {
      const res = await getApplicationResumeAdmin(id, mode);
      window.open(res.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      alert.error(err.message || "Could not access the resume.");
    } finally {
      setResumeBusy(false);
    }
  };

  return (
    <div className="careers-drawer-overlay" onClick={onClose}>
      <div className="careers-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="careers-drawer-head">
          <div>
            <h2>{data?.applicationId || "Application"}</h2>
            {data?.job?.title && <p className="admin-empty" style={{ padding: 0 }}>{data.job.title}</p>}
          </div>
          <button className="careers-drawer-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {loading && <p className="admin-empty">Loading...</p>}

        {!loading && data && (
          <>
            <div className="careers-drawer-section careers-drawer-status">
              <h3>Status</h3>
              <select value={data.status} onChange={handleStatusChange} disabled={statusSaving}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="careers-drawer-section">
              <h3>Personal Information</h3>
              <Row label="Name" value={data.name} />
              <Row label="Email" value={data.email} />
              <Row label="Phone" value={data.phone} />
              <Row label="Location" value={data.location} />
            </div>

            <div className="careers-drawer-section">
              <h3>Professional Information</h3>
              <Row label="Experience" value={data.experience} />
              <Row label="Current/Recent Role" value={data.currentRole} />
              <Row label="Expected Salary" value={data.expectedSalary} />
              <Row label="Notice Period" value={data.noticePeriod} />
            </div>

            <div className="careers-drawer-section">
              <h3>Links</h3>
              <Row label="LinkedIn" value={data.linkedin} />
              <Row label="GitHub" value={data.github} />
              <Row label="Portfolio" value={data.portfolio} />
            </div>

            <div className="careers-drawer-section">
              <h3>Resume</h3>
              <p className="admin-empty" style={{ padding: 0 }}>
                {data.resume.originalFileName}{" "}
                {data.resume.size ? `(${Math.round(data.resume.size / 1024)} KB)` : ""}
              </p>
              <div className="careers-drawer-resume-actions">
                <button className="admin-btn" disabled={resumeBusy} onClick={() => handleResume("view")}>
                  View Resume
                </button>
                <button className="admin-btn" disabled={resumeBusy} onClick={() => handleResume("download")}>
                  Download Resume
                </button>
              </div>
            </div>

            {data.coverLetter && (
              <div className="careers-drawer-section">
                <h3>Cover Letter</h3>
                <p style={{ fontSize: 13.5, whiteSpace: "pre-line" }}>{data.coverLetter}</p>
              </div>
            )}

            {data.answers?.length > 0 && (
              <div className="careers-drawer-section">
                <h3>Application Questions</h3>
                {data.answers.map((a) => (
                  <div key={a.questionId} className="careers-drawer-qa">
                    <strong>{a.questionText}</strong>
                    <span>{Array.isArray(a.answer) ? a.answer.join(", ") : String(a.answer ?? "—")}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="careers-drawer-section">
              <h3>Consent</h3>
              <Row label="Policy accepted" value={data.consent.accepted ? "Yes" : "No"} />
              <Row label="Policy version" value={data.consent.policyVersion} />
              <Row label="Accepted at" value={new Date(data.consent.acceptedAt).toLocaleString()} />
            </div>

            <div className="careers-drawer-section">
              <h3>Internal Notes</h3>
              <div className="careers-drawer-notes-list">
                {(data.internalNotes || []).length === 0 && (
                  <p className="admin-empty" style={{ padding: 0 }}>
                    No notes yet.
                  </p>
                )}
                {(data.internalNotes || []).map((n, i) => (
                  <div key={i} className="careers-drawer-note">
                    <div>{n.text}</div>
                    <div className="careers-drawer-note-meta">
                      {n.addedBy?.name || "Staff"} &middot; {new Date(n.addedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="careers-drawer-add-note">
                <textarea
                  rows={2}
                  maxLength={2000}
                  placeholder="Add a private internal note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
                <button
                  className="admin-btn"
                  disabled={noteSaving || !noteText.trim()}
                  onClick={handleAddNote}
                  style={{ alignSelf: "flex-start" }}
                >
                  {noteSaving ? "Adding..." : "Add Note"}
                </button>
              </div>
            </div>

            <div className="careers-drawer-section">
              <h3>Timeline</h3>
              <div className="careers-drawer-timeline">
                {(data.timeline || [])
                  .slice()
                  .reverse()
                  .map((t, i) => (
                    <div key={i} className="careers-drawer-timeline-item">
                      {t.event.replace(/_/g, " ")} {t.detail ? `— ${t.detail}` : ""} &middot;{" "}
                      {new Date(t.at).toLocaleString()}
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
