import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  forgotPasswordAdmin,
  verifyForgotPasswordOtpAdmin,
  resetForgotPasswordAdmin,
} from "../../api/client";
import { useAlert } from "../../context/AlertContext";
import "./AdminLogin.css";

const RESEND_COOLDOWN_S = 60;

// Unauthenticated by design — reachable from the login screen without a
// session. Three steps: email -> OTP -> new password. The server never
// reveals whether an email is registered (see authController.js), so
// this always moves forward to the OTP step regardless of the outcome.
export default function ForgotPassword() {
  const alert = useAlert();
  const navigate = useNavigate();

  const [step, setStep] = useState("email"); // "email" | "otp" | "reset"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [status, setStatus] = useState("idle");
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN_S);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const submitEmail = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const data = await forgotPasswordAdmin({ email: email.trim() });
      alert.success(data?.message || "If that email is registered, a code has been sent.");
      setStep("otp");
      startCooldown();
    } catch (err) {
      alert.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setStatus("idle");
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setStatus("loading");
    try {
      await forgotPasswordAdmin({ email: email.trim() });
      alert.success("A new code has been sent, if that email is registered.");
      startCooldown();
    } catch (err) {
      alert.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setStatus("idle");
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      alert.error("Please enter the 6-digit code.");
      return;
    }
    setStatus("loading");
    try {
      await verifyForgotPasswordOtpAdmin({ email: email.trim(), otp: otp.trim() });
      setStep("reset");
    } catch (err) {
      alert.error(err.message || "Incorrect or expired code.");
    } finally {
      setStatus("idle");
    }
  };

  const submitReset = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert.error("New password and confirmation do not match.");
      return;
    }
    setStatus("loading");
    try {
      await resetForgotPasswordAdmin({
        email: email.trim(),
        otp: otp.trim(),
        newPassword: passwords.newPassword,
      });
      alert.success("Password reset. Please log in with your new password.");
      navigate("/admin/login");
    } catch (err) {
      alert.error(err.message || "Could not reset your password.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="admin-login-wrap">
      {step === "email" && (
        <form className="admin-login-form" onSubmit={submitEmail}>
          <span className="admin-login-eyebrow">Staff Portal</span>
          <h1>Forgot Password</h1>
          <p className="admin-empty" style={{ marginTop: "-0.5rem" }}>
            Enter your registered work email and we&apos;ll send you a verification code.
          </p>

          <label className="admin-field">
            <span>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </label>

          <button className="admin-btn admin-btn-primary" disabled={status === "loading"}>
            {status === "loading" ? "Sending..." : "Send Code"}
          </button>
          <Link to="/admin/login" className="admin-btn admin-btn-ghost">
            Back to login
          </Link>
        </form>
      )}

      {step === "otp" && (
        <form className="admin-login-form" onSubmit={submitOtp}>
          <span className="admin-login-eyebrow">Staff Portal</span>
          <h1>Enter Verification Code</h1>
          <p className="admin-empty" style={{ marginTop: "-0.5rem" }}>
            If {email} is registered, a 6-digit code has been sent to it. The code expires in 5
            minutes.
          </p>

          <label className="admin-field">
            <span>Verification Code</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              autoComplete="one-time-code"
            />
          </label>

          <button className="admin-btn admin-btn-primary" disabled={status === "loading"}>
            {status === "loading" ? "Verifying..." : "Verify Code"}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-ghost"
            onClick={resend}
            disabled={cooldown > 0 || status === "loading"}
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
        </form>
      )}

      {step === "reset" && (
        <form className="admin-login-form" onSubmit={submitReset}>
          <span className="admin-login-eyebrow">Staff Portal</span>
          <h1>Set a New Password</h1>

          <label className="admin-field">
            <span>New Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={passwords.newPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
              autoComplete="new-password"
            />
          </label>
          <label className="admin-field">
            <span>Confirm New Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
              autoComplete="new-password"
            />
          </label>

          <button className="admin-btn admin-btn-primary" disabled={status === "loading"}>
            {status === "loading" ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
}
