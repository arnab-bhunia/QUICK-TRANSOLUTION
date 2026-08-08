import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useAlert } from "../../context/AlertContext";
import "./AdminLogin.css";

export default function AdminLogin() {
  const { login, staff } = useAdminAuth();
  const alert = useAlert();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("idle");

  if (staff) {
    navigate("/admin", { replace: true });
    return null;
  }

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await login(form);
      navigate("/admin");
    } catch (err) {
      alert.error(err.message || "Invalid email or password.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="admin-login-wrap">
      <form className="admin-login-form" onSubmit={submit}>
        <span className="admin-login-eyebrow">Staff Portal</span>
        <h1>Staff Login</h1>

        <label className="admin-field">
          <span>Email</span>
          <input
            type="email"
            required
            value={form.email}
            onChange={update("email")}
            autoComplete="username"
          />
        </label>

        <label className="admin-field">
          <span>Password</span>
          <input
            type="password"
            required
            value={form.password}
            onChange={update("password")}
            autoComplete="current-password"
          />
        </label>

        <button className="admin-btn admin-btn-primary" disabled={status === "loading"}>
          {status === "loading" ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
