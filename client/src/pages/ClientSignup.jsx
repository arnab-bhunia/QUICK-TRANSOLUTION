import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClientAuth } from "../context/ClientAuthContext";
import { useAlert } from "../context/AlertContext";
import "./ClientAuth.css";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  dob: "",
  industry: "",
  password: "",
  confirmPassword: "",
};

// Re-enforced on the server too (server/src/controllers/clientAuthController.js)
// — these are for instant feedback, not the actual security boundary.
const PHONE_RE = /^\d{10}$/;

export default function ClientSignup() {
  const { signup } = useClientAuth();
  const alert = useAlert();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");

  const update = (field) => (e) => {
    let value = e.target.value;
    if (field === "phone") {
      // Digits only, capped at 10 — stops non-numeric characters and
      // over-length input at the point of typing rather than only on
      // submit.
      value = value.replace(/\D/g, "").slice(0, 10);
    }
    setForm((f) => ({ ...f, [field]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!PHONE_RE.test(form.phone)) {
      alert.error("Mobile number must be exactly 10 digits.");
      return;
    }
    if (form.password.length < 8) {
      alert.error("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      alert.error("Passwords do not match.");
      return;
    }

    setStatus("loading");
    try {
      const result = await signup(form);
      // Account exists now but is unverified — route to the OTP screen
      // instead of the dashboard. See ClientAuthContext.jsx: signup()
      // deliberately doesn't log the user in yet.
      navigate("/verify-email", { state: { email: result.email } });
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
            <span>
              Full Name (as per Aadhaar) <em className="client-auth-required">*</em>
            </span>
            <input
              type="text"
              required
              maxLength={100}
              value={form.name}
              onChange={update("name")}
              autoComplete="name"
            />
          </label>

          <label className="client-auth-field">
            <span>
              Email <em className="client-auth-required">*</em>
            </span>
            <input
              type="email"
              required
              maxLength={254}
              value={form.email}
              onChange={update("email")}
              autoComplete="email"
            />
          </label>

          <label className="client-auth-field">
            <span>
              Mobile Number <em className="client-auth-required">*</em>
            </span>
            <input
              type="tel"
              inputMode="numeric"
              required
              maxLength={10}
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={update("phone")}
              autoComplete="tel"
            />
          </label>

          <label className="client-auth-field">
            <span>
              Date of Birth (as per Aadhaar) <em className="client-auth-required">*</em>
            </span>
            <input
              type="date"
              required
              max={new Date().toISOString().split("T")[0]}
              value={form.dob}
              onChange={update("dob")}
            />
          </label>

          <label className="client-auth-field">
            <span>Industry <span className="client-auth-optional">(optional)</span></span>
            <input
              type="text"
              maxLength={100}
              placeholder="e.g. Textiles, Pharmaceuticals, E-commerce"
              value={form.industry}
              onChange={update("industry")}
            />
          </label>

          <label className="client-auth-field">
            <span>
              Password <em className="client-auth-required">*</em>
            </span>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={update("password")}
              autoComplete="new-password"
            />
            <span className="client-auth-hint">Must be at least 8 characters.</span>
          </label>

          <label className="client-auth-field">
            <span>
              Retype Password <em className="client-auth-required">*</em>
            </span>
            <input
              type="password"
              required
              minLength={8}
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
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
