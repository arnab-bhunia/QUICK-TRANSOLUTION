import { useState } from "react";
import { changePasswordAdmin } from "../../api/client";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useAlert } from "../../context/AlertContext";
import "./AdminLogin.css";

// Shown instead of the dashboard whenever staff.mustChangePassword is true
// — most commonly right after an admin creates the account with a
// temporary password (including the "same as DOB" convenience option,
// which is predictable and must be replaced before real use).
export default function ChangePassword() {
  const { refresh, logout } = useAdminAuth();
  const alert = useAlert();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [status, setStatus] = useState("idle");

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      alert.error("New password and confirmation do not match.");
      return;
    }
    setStatus("loading");
    try {
      await changePasswordAdmin({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      alert.success("Password updated. Please continue.");
      await refresh();
    } catch (err) {
      alert.error(err.message || "Could not update password.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="admin-login-wrap">
      <form className="admin-login-form" onSubmit={submit}>
        <span className="admin-login-eyebrow">Security Check</span>
        <h1>Set a New Password</h1>
        <p className="admin-empty" style={{ marginTop: "-0.5rem" }}>
          Your account is on a temporary password and must be updated before you can continue.
        </p>

        <label className="admin-field">
          <span>Current (temporary) password</span>
          <input
            type="password"
            required
            value={form.currentPassword}
            onChange={update("currentPassword")}
            autoComplete="current-password"
          />
        </label>

        <label className="admin-field">
          <span>New password</span>
          <input
            type="password"
            required
            minLength={8}
            value={form.newPassword}
            onChange={update("newPassword")}
            autoComplete="new-password"
          />
        </label>

        <label className="admin-field">
          <span>Confirm new password</span>
          <input
            type="password"
            required
            minLength={8}
            value={form.confirmPassword}
            onChange={update("confirmPassword")}
            autoComplete="new-password"
          />
        </label>

        <button className="admin-btn admin-btn-primary" disabled={status === "loading"}>
          {status === "loading" ? "Updating..." : "Update Password"}
        </button>
        <button
          type="button"
          className="admin-btn admin-btn-ghost"
          onClick={logout}
        >
          Log out instead
        </button>
      </form>
    </div>
  );
}
