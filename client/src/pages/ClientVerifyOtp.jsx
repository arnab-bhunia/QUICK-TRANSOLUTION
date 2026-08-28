import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useClientAuth } from "../context/ClientAuthContext";
import { useAlert } from "../context/AlertContext";
import "./ClientAuth.css";

const RESEND_COOLDOWN_S = 60;

export default function ClientVerifyOtp() {
  const { verifyEmail, resendOtp } = useClientAuth();
  const alert = useAlert();
  const navigate = useNavigate();
  const location = useLocation();

  // Email arrives via router state (from signup / a login redirect) or a
  // ?email= query param as a fallback — e.g. if this page was refreshed
  // and the router state was lost.
  const emailFromQuery = new URLSearchParams(location.search).get("email");
  const [email] = useState(location.state?.email || emailFromQuery || "");

  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("idle");
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!email) {
      navigate("/signup", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

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

  const submit = async (e) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      alert.error("Please enter the 6-digit code.");
      return;
    }
    setStatus("loading");
    try {
      await verifyEmail({ email, otp: otp.trim() });
      alert.success("Email verified — welcome!");
      navigate("/dashboard");
    } catch (err) {
      alert.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setStatus("idle");
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setStatus("resending");
    try {
      await resendOtp({ email });
      alert.success("A new code has been sent to your email.");
      startCooldown();
    } catch (err) {
      alert.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setStatus("idle");
    }
  };

  if (!email) return null;

  return (
    <section className="section client-auth-section">
      <div className="container client-auth-inner">
        <form className="client-auth-form" onSubmit={submit}>
          <span className="eyebrow">Verify Your Email</span>
          <h1>Enter the code we sent you</h1>
          <p className="client-form-note client-auth-verify-sub">
            We sent a 6-digit verification code to <strong>{email}</strong>. It expires in
            10 minutes.
          </p>

          <label className="client-auth-field">
            <span>Verification Code</span>
            <input
              type="text"
              inputMode="numeric"
              required
              maxLength={6}
              autoFocus
              placeholder="123456"
              className="client-auth-otp-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </label>

          <button className="btn btn-primary client-auth-submit" disabled={status === "loading"}>
            {status === "loading" ? "Verifying..." : "Verify Email"}
          </button>

          <p className="client-auth-switch">
            Didn&apos;t get a code?{" "}
            {cooldown > 0 ? (
              <span className="client-auth-resend-cooldown">Resend in {cooldown}s</span>
            ) : (
              <button
                type="button"
                className="client-auth-resend-btn"
                onClick={resend}
                disabled={status === "resending"}
              >
                {status === "resending" ? "Sending..." : "Resend code"}
              </button>
            )}
          </p>

          <p className="client-auth-switch">
            <Link to="/login">Back to sign in</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
