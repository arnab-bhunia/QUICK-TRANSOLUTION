import crypto from "crypto";

// crypto.randomInt is cryptographically secure (unlike Math.random),
// which matters here — a predictable OTP generator would defeat the
// whole point of the verification step.
export function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString(); // 6 digits, "100000"–"999999"
}

// HMAC (keyed hash) rather than plain SHA-256: without the server's own
// key, a stolen otpHash value can't be brute-forced offline against the
// 900,000 possible 6-digit codes. Binding the email into the HMAC input
// also means two different accounts' OTPs never collide in the hash
// even if they happened to generate the identical 6-digit code.
export function hashOtp(otp, email) {
  const key = process.env.ENCRYPTION_KEY || "fallback-otp-key";
  return crypto
    .createHmac("sha256", key)
    .update(`${String(email).trim().toLowerCase()}:${otp}`)
    .digest("hex");
}
