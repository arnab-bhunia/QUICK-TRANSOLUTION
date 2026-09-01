import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClientAuth } from "../context/ClientAuthContext";
import { useAlert } from "../context/AlertContext";
import DobPicker from "../components/DobPicker";
import "./ClientAuth.css";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  dob: "",
  industry: "",
  password: "",
  confirmPassword: "",
  agreedToTerms: false,
};

const PHONE_RE = /^\d{10}$/;

export default function ClientSignup() {
  const { signup } = useClientAuth();
  const alert = useAlert();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [showEmailInfo, setShowEmailInfo] = useState(false);

  const update = (field) => (e) => {
    let value = e.target.value;

    if (field === "phone") {
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

    if (!form.dob) {
      alert.error("Please select your date of birth.");
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

    if (!form.agreedToTerms) {
      alert.error("Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    setStatus("loading");

    try {
      const result = await signup(form);

      navigate("/verify-email", {
        state: { email: result.email },
      });
    } catch (err) {
      alert.error(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setStatus("idle");
    }
  };

  return (
    <section className="section client-auth-section">
      <div className="client-auth-bg" aria-hidden="true" />
      <div className="container client-auth-inner">
        <form className="client-auth-form" onSubmit={submit}>
          <span className="eyebrow">Create Account</span>

          <h1>Sign up for a client account</h1>

          <div className="client-auth-intro">
            <span><em className="client-auth-required">*</em> marked fields are required.</span>
          </div>

          <div className="client-auth-row">
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
              <div className="client-auth-input-info">
                <input
                  type="email"
                  required
                  maxLength={254}
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={update("email")}
                  autoComplete="email"
                />
                <button
                  type="button"
                  className="client-auth-info-btn"
                  aria-label="Email verification information"
                  aria-expanded={showEmailInfo}
                  onClick={() => setShowEmailInfo((value) => !value)}
                >
                  i
                </button>
              </div>
              {showEmailInfo && (
                <div className="client-auth-info-box">
                  We will send a verification code to this email. Your account will be
                  created, but you must verify your email before signing in.
                </div>
              )}
            </label>
          </div>

        <div className="client-auth-row">
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
              <DobPicker
                value={form.dob}
                onChange={(iso) => setForm((f) => ({ ...f, dob: iso }))}
                required
              />
            </label>
          </div>

          <label className="client-auth-field">
            <span>
              Industry{" "}
              <span className="client-auth-optional">(optional)</span>
            </span>

            <input
              type="text"
              maxLength={100}
              placeholder="e.g. Textiles, Pharmaceuticals, E-commerce"
              value={form.industry}
              onChange={update("industry")}
            />
          </label>

          <div className="client-auth-row">
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
          </div>

          <label className="client-auth-consent">
            <input
              type="checkbox"
              checked={form.agreedToTerms}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  agreedToTerms: e.target.checked,
                }))
              }
              required
            />

            <span>
              I agree to the{" "}
              <Link
                to="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                to="/terms-conditions"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </Link>
              .
            </span>
          </label>

          <button
            className="btn btn-primary client-auth-submit"
            disabled={status === "loading"}
          >
            {status === "loading"
              ? "Creating account..."
              : "Sign Up"}
          </button>

          <p className="client-auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </section>
  );
}