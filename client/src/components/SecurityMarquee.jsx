import "./SecurityMarquee.css";

export default function SecurityMarquee() {
  return (
    <div className="security-marquee-sticky">
      <div className="security-marquee">
        <div className="security-marquee-track">
          <span className="security-icon">🛡️</span>

          <span>
            Our executives will NEVER ask for your OTP, UPI PIN, CVV,
            passwords or verification codes. Please contact us only
            through official numbers.
          </span>
        </div>
      </div>
    </div>
  );
}