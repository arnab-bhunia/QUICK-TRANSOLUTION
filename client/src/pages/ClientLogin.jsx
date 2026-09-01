import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClientAuth } from "../context/ClientAuthContext";
import { useAlert } from "../context/AlertContext";
import "./ClientAuth.css";

export default function ClientLogin() {
  const { login, resendOtp } = useClientAuth();
  const alert = useAlert();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("idle");

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      if (err.data?.needsVerification) {
        // A fresh code is more useful than whatever they were sent at
        // signup, which could be long expired by now — send a new one
        // before routing them to the verification screen.
        try {
          await resendOtp({ email: err.data.email });
        } catch {
          // If resend itself fails, they can still hit "Resend code" on
          // the next screen — no need to block the redirect over this.
        }
        alert.error("Please verify your email first — we've sent a new code.");
        navigate("/verify-email", { state: { email: err.data.email } });
        return;
      }
      alert.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <section className="section client-auth-section">
      <div className="client-auth-bg" aria-hidden="true" />
      <div className="container client-auth-inner">
        <form className="client-auth-form" onSubmit={submit}>
          <span className="eyebrow">Client Login</span>
          <h1>Sign in to your account</h1>

          <label className="client-auth-field">
            <span>Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={update("email")}
              autoComplete="email"
            />
          </label>

          <label className="client-auth-field">
            <span>Password</span>
            <input
              type="password"
              required
              value={form.password}
              onChange={update("password")}
              autoComplete="current-password"
            />
          </label>

          <button className="btn btn-primary client-auth-submit" disabled={status === "loading"}>
            {status === "loading" ? "Signing in..." : "Sign In"}
          </button>

          <p className="client-auth-switch">
            No account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </div>
    </section>
  );
}