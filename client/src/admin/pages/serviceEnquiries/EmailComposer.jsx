import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import {
  sendServiceEnquiryEmailAdmin,
  getActiveServiceEnquiryEmailOperationAdmin,
} from "../../../api/client";
import { useAlert } from "../../../context/AlertContext";
import { isSafeUrl, sanitizeUrl } from "../../../utils/safeUrl";
import "./EmailComposer.css";

// How often to re-check whether another employee's active send has
// cleared, while this composer is open and blocked by one. Purely a
// convenience so staff don't have to close/reopen the drawer to notice
// it's free again — the real guard is still the backend's atomic claim
// at submit time, regardless of what this poll last saw.
const ACTIVE_OPERATION_POLL_MS = 5000;

// A dedicated composer for this one job — replying to a Service
// Enquiry — rather than repurposing BlogEditor. Deliberately a smaller
// toolbar than the blog editor (no images/tables): an operational
// customer email doesn't need document-authoring tools, and StarterKit
// already gives headings/bold/italic/lists/blockquote for free.
function defaultTemplate(recipientName, serviceTitle) {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: `Hi ${recipientName || "there"},` }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: `Thank you for your enquiry regarding ${serviceTitle || "our services"}. `,
          },
        ],
      },
      { type: "paragraph", content: [{ type: "text", text: "" }] },
      {
        type: "paragraph",
        content: [{ type: "text", text: "Best regards," }],
      },
    ],
  };
}

export default function EmailComposer({
  enquiryId,
  recipientEmail,
  recipientName,
  serviceTitle,
  onCancel,
  onSent,
  onSendFailed,
}) {
  const alert = useAlert();
  const [subject, setSubject] = useState(`Regarding your enquiry for ${serviceTitle || "our services"}`);
  const [sending, setSending] = useState(false);
  // One key per open of this composer, reused across any retry of the
  // same click (e.g. the request times out and the browser or this
  // component retries) — see sendServiceEnquiryEmailAdmin on the server
  // for what this buys: a retried request with the same key is
  // recognized as the same attempt and is never sent twice.
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  // Someone else's active send on this enquiry, if any — checked before
  // the composer even lets staff type, and re-checked on an interval
  // while blocked. Not the actual guard (the backend's atomic claim is);
  // this only makes the UI proactively helpful instead of only failing
  // at submit time.
  const [activeOperation, setActiveOperation] = useState(undefined); // undefined = still checking
  const pollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const check = () => {
      getActiveServiceEnquiryEmailOperationAdmin(enquiryId)
        .then((res) => {
          if (!cancelled) setActiveOperation(res.active || null);
        })
        .catch(() => {
          // If the check itself fails, don't block composing — the
          // backend's atomic claim at submit time is still authoritative.
          if (!cancelled) setActiveOperation(null);
        });
    };

    check();
    pollRef.current = setInterval(check, ACTIVE_OPERATION_POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enquiryId]);

  const blocked = Boolean(activeOperation);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        protocols: ["http", "https", "mailto"],
        validate: (href) => isSafeUrl(href),
      }),
    ],
    content: defaultTemplate(recipientName, serviceTitle),
  });

  useEffect(() => {
    if (editor) editor.setEditable(!blocked && !sending);
  }, [editor, blocked, sending]);

  const closeUnlessSending = () => {
    if (!sending) onCancel();
  };

  const setLink = () => {
    const url = window.prompt("Link URL");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const safeUrl = sanitizeUrl(url);
    if (!safeUrl) {
      alert.error("That link's URL type isn't allowed. Use an http(s) or mailto link.");
      return;
    }
    editor.chain().focus().setLink({ href: safeUrl }).run();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (sending || blocked || !editor) return; // guards against a duplicate submit

    const trimmedSubject = subject.trim();
    if (!trimmedSubject) {
      alert.error("Please enter a subject line.");
      return;
    }
    if (editor.isEmpty) {
      alert.error("Please write a message before sending.");
      return;
    }

    setSending(true);
    try {
      const result = await sendServiceEnquiryEmailAdmin(enquiryId, {
        subject: trimmedSubject,
        body: editor.getJSON(),
        idempotencyKey,
      });

      if (result.status === "SENT") {
        alert.success(result.message || "Email sent.");
        onSent?.();
        return;
      }

      if (result.status === "UNKNOWN") {
        // We genuinely don't know whether this was delivered. Never
        // report it as a success, and never let this composer offer a
        // resend — that's exactly the automatic-retry-into-duplicate
        // scenario this whole design exists to prevent. A supervisor
        // resolves it from the enquiry's activity timeline.
        alert.error(result.message || "Delivery could not be confirmed. A supervisor will need to review this.");
        onSendFailed?.();
        return;
      }

      // QUEUED/SENDING: an identical in-flight attempt (idempotency
      // replay) is still being processed elsewhere. Not a success yet —
      // just let the user know rather than closing the composer.
      alert.error(result.message || "This email is still being sent. Please wait a moment.");
    } catch (err) {
      if (err.status === 409) {
        // Someone else won the claim between our last check and this
        // submit. Surface exactly who, and switch into the blocked view
        // rather than just showing a generic error toast.
        setActiveOperation(err.data?.activeOperation || { status: "SENDING" });
        alert.error(err.message || "Another team member is currently sending an email for this enquiry.");
        return;
      }
      alert.error(err.message || "Could not send the email.");
      // The backend records a failed attempt on the enquiry's timeline
      // too (not just successes) — refresh it so that shows up, but
      // leave the composer open with the drafted content intact so
      // staff can retry without re-typing anything.
      onSendFailed?.();
    } finally {
      setSending(false);
    }
  };

  const Btn = ({ active, onClick, children, title }) => (
    <button
      type="button"
      className={`email-composer-btn ${active ? "is-active" : ""}`}
      onClick={onClick}
      title={title}
      disabled={sending || blocked}
    >
      {children}
    </button>
  );

  return (
    <div
      className="email-composer-overlay"
      onClick={(e) => {
        e.stopPropagation(); // don't also close the enquiry drawer behind this
        closeUnlessSending();
      }}
    >
      <div
        className="email-composer admin-card"
        role="dialog"
        aria-modal="true"
        aria-label="Send Email"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-panel-head">
          <h3>Send Email</h3>
        </div>

        {blocked && (
          <div className="email-composer-conflict-banner" role="alert">
            <strong>Email currently being sent</strong>
            <span>
              {activeOperation?.claimedBy?.name
                ? `Started by ${activeOperation.claimedBy.name}`
                : "Started by another team member"}
              {activeOperation?.claimedAt
                ? ` · ${new Date(activeOperation.claimedAt).toLocaleTimeString()}`
                : ""}
            </span>
            <span>You can't send another email for this enquiry until that one finishes.</span>
          </div>
        )}

        <form onSubmit={submit}>
          <label className="admin-field">
            <span>To</span>
            <input value={recipientEmail} disabled readOnly />
          </label>

          <label className="admin-field">
            <span>Subject</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={sending || blocked}
              maxLength={200}
              required
            />
          </label>

          <label className="admin-field">
            <span>Message</span>
          </label>

          {editor && (
            <div className="email-composer-editor-wrap">
              <div className="email-composer-toolbar">
                <Btn
                  title="Bold"
                  active={editor.isActive("bold")}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                >
                  <strong>B</strong>
                </Btn>
                <Btn
                  title="Italic"
                  active={editor.isActive("italic")}
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                  <em>I</em>
                </Btn>
                <Btn
                  title="Underline"
                  active={editor.isActive("underline")}
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                  <span style={{ textDecoration: "underline" }}>U</span>
                </Btn>
                <span className="email-composer-divider" />
                <Btn
                  title="Bullet list"
                  active={editor.isActive("bulletList")}
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                  • List
                </Btn>
                <Btn
                  title="Numbered list"
                  active={editor.isActive("orderedList")}
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                  1. List
                </Btn>
                <span className="email-composer-divider" />
                <Btn title="Link" active={editor.isActive("link")} onClick={setLink}>
                  Link
                </Btn>
              </div>
              <EditorContent editor={editor} className="email-composer-content" />
            </div>
          )}

          <div className="email-composer-actions">
            <button type="button" className="admin-btn" onClick={onCancel} disabled={sending}>
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={sending || blocked || activeOperation === undefined}
            >
              {sending ? "Sending..." : blocked ? "Someone else is sending..." : "Send Email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
