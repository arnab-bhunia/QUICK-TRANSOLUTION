import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClientAuth } from "../context/ClientAuthContext";
import { useAlert } from "../context/AlertContext";
import "./ClientAuth.css";

export default function ClientSignup() {
  const { signup } = useClientAuth();
  const alert = useAlert();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [status, setStatus] = useState("idle");

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await signup(form);
      navigate("/dashboard");
    } catch (err) {
      alert.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <section className="section client-auth-section">
      <div className="container client-auth-inner">
        <form className="client-auth-form" onSubmit={submit}>
          <span className="eyebrow">Create Account</span>
          <h1>Sign up for a client account</h1>

          <label className="client-auth-field">
            <span>Full name</span>
            <input type="text" required value={form.name} onChange={update("name")} />
          </label>

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
            <span>Mobile number</span>
            <input type="tel" required value={form.phone} onChange={update("phone")} />
          </label>

          <label className="client-auth-field">
            <span>Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={update("password")}
              autoComplete="new-password"
            />
          </label>

          <button className="btn btn-primary client-auth-submit" disabled={status === "loading"}>
            {status === "loading" ? "Creating account..." : "Sign Up"}
          </button>

          <p className="client-auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
