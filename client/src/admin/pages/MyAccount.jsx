import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAccountAdmin, changePasswordAdmin } from "../../api/client";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useAlert } from "../../context/AlertContext";
import "./MyAccount.css";

// Mirrors server/src/config/permissions.js ROLE_LABELS convention (same
// display-only duplication already used in StaffPanel.jsx) — the real
// role value is always what the server sends.
const ROLE_LABELS = {
  admin: "Admin",
  hr: "HR",
  manager: "Manager",
  staff: "Staff",
  content_writer: "Content Writer",
};

// Static, deterministic "profile picture" — a two-letter initials badge
// derived from the employee's own name. Per spec, V1 intentionally has
// no upload/edit capability and stores nothing new in MongoDB; this is
// the simplest way to give the identity header a picture-shaped anchor
// without a placeholder photo that wouldn't actually resemble anyone.
function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function MyAccount() {
  const { staff, refresh } = useAdminAuth();
  const alert = useAlert();

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwStatus, setPwStatus] = useState("idle");

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAccountAdmin()
      .then((data) => {
        if (active) setAccount(data);
      })
      .catch((err) => {
        if (active) alert.error(err.message || "Could not load your account details.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updatePw = (field) => (e) => setPwForm((f) => ({ ...f, [field]: e.target.value }));

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      alert.error("New password and confirmation do not match.");
      return;
    }
    setPwStatus("loading");
    try {
      await changePasswordAdmin({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      alert.success("Password updated successfully.");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      await refresh();
    } catch (err) {
      alert.error(err.message || "Could not update password.");
    } finally {
      setPwStatus("idle");
    }
  };

  const displayName = account?.name || staff?.name;
  const displayRole = account?.role || staff?.role;

  return (
    <div className="my-account">
      <div className="admin-panel-head">
        <h2>My Account</h2>
      </div>

      <section className="admin-card my-account-profile-card">
        <div className="my-account-avatar" aria-hidden="true">
          {initials(displayName)}
        </div>
        <div className="my-account-identity">
          <h3>{displayName || "—"}</h3>
          <span className="my-account-role">{ROLE_LABELS[displayRole] || displayRole || "—"}</span>
          <span className="my-account-company">Quick Transolution</span>
        </div>
        <div className="my-account-quick-facts">
          <div className="my-account-quick-fact">
            <span className="my-account-quick-label">Office</span>
            <span>{loading ? "—" : account?.office?.name || "—"}</span>
          </div>
          <div className="my-account-quick-fact">
            <span className="my-account-quick-label">Reports To</span>
            <span>{loading ? "—" : account?.manager?.name || "—"}</span>
          </div>
        </div>
      </section>

      <section className="admin-card my-account-section">
        <h3 className="my-account-section-title">Personal &amp; Organization Information</h3>
        <div className="my-account-info-grid">
          <div className="my-account-info-item">
            <span className="my-account-quick-label">Full Name</span>
            <span>{loading ? "—" : account?.name || "—"}</span>
          </div>
          <div className="my-account-info-item">
            <span className="my-account-quick-label">Email</span>
            <span>{loading ? "—" : account?.email || "—"}</span>
          </div>
          <div className="my-account-info-item">
            <span className="my-account-quick-label">Role</span>
            <span>{loading ? "—" : ROLE_LABELS[account?.role] || account?.role || "—"}</span>
          </div>
          <div className="my-account-info-item">
            <span className="my-account-quick-label">Reporting Manager</span>
            <span>{loading ? "—" : account?.manager?.name || "—"}</span>
          </div>
          <div className="my-account-info-item">
            <span className="my-account-quick-label">Office Location</span>
            <span>{loading ? "—" : account?.office?.name || "—"}</span>
          </div>
        </div>
      </section>

      <section className="admin-card my-account-section">
        <h3 className="my-account-section-title">Security</h3>

        <form className="my-account-password-form" onSubmit={submitPasswordChange}>
          <label className="admin-field">
            <span>Current Password</span>
            <input
              type="password"
              required
              value={pwForm.currentPassword}
              onChange={updatePw("currentPassword")}
              autoComplete="current-password"
            />
          </label>
          <label className="admin-field">
            <span>New Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={pwForm.newPassword}
              onChange={updatePw("newPassword")}
              autoComplete="new-password"
            />
          </label>
          <label className="admin-field">
            <span>Confirm New Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={pwForm.confirmPassword}
              onChange={updatePw("confirmPassword")}
              autoComplete="new-password"
            />
          </label>
          <button className="admin-btn admin-btn-primary" disabled={pwStatus === "loading"}>
            {pwStatus === "loading" ? "Updating..." : "Change Password"}
          </button>
        </form>

        <div className="my-account-forgot-row">
          <span className="admin-empty">Forgotten your password entirely?</span>
          <Link to="/admin/forgot-password" className="my-account-forgot-link">
            Reset it via email
          </Link>
        </div>
      </section>

      <section className="admin-card my-account-section">
        <h3 className="my-account-section-title">Account Activity</h3>
        <div className="my-account-info-item">
          <span className="my-account-quick-label">Last Login</span>
          <span>{loading ? "—" : formatDateTime(account?.lastLoginAt)}</span>
        </div>
      </section>
    </div>
  );
}
