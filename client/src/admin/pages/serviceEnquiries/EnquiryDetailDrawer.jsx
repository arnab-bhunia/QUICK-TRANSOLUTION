import { useEffect, useState } from "react";
import {
  getServiceEnquiryAdmin,
  getServiceEnquiryHistoryAdmin,
  updateServiceEnquiryStatusAdmin,
  getActiveServiceEnquiryEmailOperationAdmin,
  resolveServiceEnquiryEmailOperationAdmin,
} from "../../../api/client";
import { useAlert } from "../../../context/AlertContext";
import EmailComposer from "./EmailComposer";
import "./EnquiryDetailDrawer.css";

const STATUS_LABELS = { new: "New", contacted: "Contacted", closed: "Closed" };

const ACTION_LABELS = {
  created: "Enquiry received",
  status_updated: "Status changed",
  email_sent: "Email sent",
  email_send_failed: "Email failed to send",
  email_send_unknown: "Email delivery unknown",
  email_operation_resolved: "Email outcome resolved",
};

// Walks a Tiptap JSON document (stored verbatim on the "email_sent"
// audit entry — see AuditLog.after.bodyJson) and pulls out plain text
// only. This is the timeline, not the composer: a short text preview is
// all it needs, and building it this way means there's no HTML from a
// stored document ever touching the DOM here — nothing to sanitize
// because nothing but text is ever produced.
function extractPlainText(node) {
  if (!node || typeof node !== "object") return "";
  if (node.type === "text") return node.text || "";
  if (Array.isArray(node.content)) {
    return node.content.map(extractPlainText).join(node.type === "paragraph" ? " " : "");
  }
  return "";
}

export default function EnquiryDetailDrawer({ id, canContact, canEmail, onClose, onUpdated }) {
  const alert = useAlert();
  const [enquiry, setEnquiry] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  // Non-null only when this enquiry has an operation stuck in UNKNOWN —
  // the one case that requires a human decision before anyone can send
  // again (see resolveServiceEnquiryEmailOperationAdmin on the server).
  const [unresolvedOperation, setUnresolvedOperation] = useState(null);
  const [resolving, setResolving] = useState(false);

  const loadDetail = () => {
    getServiceEnquiryAdmin(id)
      .then(setEnquiry)
      .catch((err) => alert.error(err.message || "Could not load this enquiry."))
      .finally(() => setLoaded(true));
  };

  const loadActiveOperation = () => {
    getActiveServiceEnquiryEmailOperationAdmin(id)
      .then((res) => setUnresolvedOperation(res.active?.status === "UNKNOWN" ? res.active : null))
      .catch(() => {});
  };

  const resolveOperation = async (resolution) => {
    if (!unresolvedOperation) return;
    setResolving(true);
    try {
      await resolveServiceEnquiryEmailOperationAdmin(id, unresolvedOperation.id, { resolution });
      alert.success(
        resolution === "did_send"
          ? "Marked as sent."
          : "Marked as not sent — a new email can now be sent."
      );
      setUnresolvedOperation(null);
      loadHistory();
      onUpdated?.();
    } catch (err) {
      alert.error(err.message || "Could not resolve this operation.");
    } finally {
      setResolving(false);
    }
  };

  const loadHistory = () => {
    setHistoryLoaded(false);
    getServiceEnquiryHistoryAdmin(id)
      .then(setHistory)
      .catch(() => {})
      .finally(() => setHistoryLoaded(true));
  };

  useEffect(() => {
    loadDetail();
    loadHistory();
    loadActiveOperation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !composerOpen) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, composerOpen]);

  const changeStatus = async (status) => {
    setStatusSaving(true);
    try {
      const updated = await updateServiceEnquiryStatusAdmin(id, status);
      setEnquiry((e) => (e ? { ...e, status: updated.status } : e));
      alert.success(`Marked as ${STATUS_LABELS[status] || status}.`);
      loadHistory();
      onUpdated?.();
    } catch (err) {
      alert.error(err.message || "Could not update status.");
    } finally {
      setStatusSaving(false);
    }
  };

  const onEmailSent = () => {
    setComposerOpen(false);
    loadHistory();
    loadActiveOperation();
    onUpdated?.();
  };

  const onEmailSendFailed = () => {
    loadHistory();
    loadActiveOperation();
  };

  return (
    <div className="se-drawer-overlay" onClick={onClose}>
      <aside
        className="se-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Enquiry details"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="se-drawer-head">
          <h3>Enquiry Details</h3>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        {!loaded && <p className="admin-empty">Loading...</p>}

        {loaded && !enquiry && <p className="admin-empty">This enquiry could not be found.</p>}

        {enquiry && (
          <>
            <div className="se-drawer-status-row">
              <span className={`admin-badge admin-badge-${enquiry.status}`}>
                {STATUS_LABELS[enquiry.status] || enquiry.status}
              </span>
              <span className="se-drawer-service">{enquiry.serviceTitle}</span>
            </div>

            {unresolvedOperation && (
              <div className="se-unknown-banner" role="alert">
                <strong>Email delivery unknown</strong>
                <span>
                  “{unresolvedOperation.subject}” — we lost connection to the mail provider
                  before we could confirm whether it sent. No new email can be sent for this
                  enquiry until this is resolved.
                </span>
                {canEmail && (
                  <div className="se-unknown-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn-ghost"
                      disabled={resolving}
                      onClick={() => resolveOperation("did_not_send")}
                    >
                      It did NOT send — allow retry
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-ghost"
                      disabled={resolving}
                      onClick={() => resolveOperation("did_send")}
                    >
                      Confirmed it DID send
                    </button>
                  </div>
                )}
              </div>
            )}

            <dl className="se-detail-list">
              <div>
                <dt>Name</dt>
                <dd>{enquiry.name}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{enquiry.phone}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{enquiry.email}</dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>{enquiry.address}</dd>
              </div>
              <div>
                <dt>Submitted</dt>
                <dd>{new Date(enquiry.requestedAt).toLocaleString()}</dd>
              </div>
              {enquiry.consent && (
                <div>
                  <dt>Consent</dt>
                  <dd>Privacy Policy &amp; Terms accepted</dd>
                </div>
              )}
            </dl>

            <div className="se-message-block">
              <span className="se-message-label">Requirement</span>
              <p>{enquiry.message}</p>
            </div>

            <div className="se-drawer-actions">
              {canContact && (
                <a className="admin-btn admin-btn-primary" href={`tel:${enquiry.phone}`}>
                  Call Now
                </a>
              )}
              {canEmail && (
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  disabled={Boolean(unresolvedOperation)}
                  onClick={() => setComposerOpen(true)}
                  title={unresolvedOperation ? "Resolve the pending email outcome first" : undefined}
                >
                  Send Email
                </button>
              )}
              {canContact && enquiry.status === "new" && (
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost"
                  disabled={statusSaving}
                  onClick={() => changeStatus("contacted")}
                >
                  Mark Contacted
                </button>
              )}
              {canContact && enquiry.status !== "closed" && (
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost"
                  disabled={statusSaving}
                  onClick={() => changeStatus("closed")}
                >
                  Close
                </button>
              )}
            </div>

            <div className="se-timeline-block">
              <h4>Activity</h4>
              {!historyLoaded && <p className="admin-empty">Loading...</p>}
              {historyLoaded && history.length === 0 && (
                <p className="admin-empty">No activity recorded yet.</p>
              )}
              <ul className="se-timeline-list">
                {history.map((entry) => {
                  const isEmailEvent = [
                    "email_sent",
                    "email_send_failed",
                    "email_send_unknown",
                  ].includes(entry.action);
                  return (
                  <li
                    key={entry._id}
                    className={
                      entry.action === "email_send_failed"
                        ? "is-failed"
                        : entry.action === "email_send_unknown"
                          ? "is-unknown"
                          : ""
                    }
                  >
                    <span className="se-timeline-action">
                      {ACTION_LABELS[entry.action] || entry.action}
                      {isEmailEvent && (
                        <span
                          className={`se-timeline-send-status ${
                            entry.after?.status === "failed"
                              ? "is-failed"
                              : entry.after?.status === "unknown"
                                ? "is-unknown"
                                : "is-sent"
                          }`}
                        >
                          {entry.after?.status === "failed"
                            ? "Failed"
                            : entry.after?.status === "unknown"
                              ? "Unknown"
                              : "Sent"}
                        </span>
                      )}
                    </span>
                    {isEmailEvent && entry.after?.subject && (
                        <p className="se-timeline-email">
                          “{entry.after.subject}” to {entry.after.recipient}
                          {entry.after.bodyJson && (
                            <>
                              <br />
                              <span className="se-timeline-email-preview">
                                {extractPlainText(entry.after.bodyJson).slice(0, 140)}
                              </span>
                            </>
                          )}
                        </p>
                      )}
                    {entry.action === "email_operation_resolved" && entry.after?.status && (
                      <p className="se-timeline-email">
                        Resolved as {entry.after.status === "SENT" ? "sent" : "not sent"}
                        {entry.after.note ? ` — “${entry.after.note}”` : ""}
                      </p>
                    )}
                    {entry.action === "status_updated" && entry.after?.status && (
                      <p className="se-timeline-email">
                        {entry.before?.status ? `${STATUS_LABELS[entry.before.status]} → ` : ""}
                        {STATUS_LABELS[entry.after.status] || entry.after.status}
                      </p>
                    )}
                    <span className="se-timeline-meta">
                      {entry.performedBy?.name ? entry.performedBy.name : "Customer"} ·{" "}
                      {new Date(entry.createdAt).toLocaleString()}
                    </span>
                  </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
      </aside>

      {composerOpen && enquiry && (
        <EmailComposer
          enquiryId={id}
          recipientEmail={enquiry.email}
          recipientName={enquiry.name}
          serviceTitle={enquiry.serviceTitle}
          onCancel={() => setComposerOpen(false)}
          onSent={onEmailSent}
          onSendFailed={onEmailSendFailed}
        />
      )}
    </div>
  );
}
