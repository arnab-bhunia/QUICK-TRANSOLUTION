import nodemailer from "nodemailer";

// ============================================================================
// MAILER — two interchangeable send methods, picked via MAIL_METHOD
// ============================================================================
// "api"  (default): Brevo's HTTPS Transactional Email API. Plain port-443
//        web request — never blocked by any host, including Render's free
//        tier, which blocks outbound SMTP ports (25/465/587) entirely.
// "smtp": traditional SMTP relay via nodemailer. Works anywhere SMTP ports
//        aren't blocked (e.g. Render paid tiers, most other hosts, or
//        local dev). Kept available for flexibility if this app is ever
//        deployed somewhere SMTP isn't restricted.
//
// Nothing calling sendMail() needs to know or care which method is
// active — same function signature either way. It now resolves to
// `{ providerMessageId }` on success (used by ServiceEnquiryEmail to
// correlate our record with the provider's own logs), and throws one of
// the two typed errors below on failure so the caller can tell a
// DEFINITE failure apart from an UNCERTAIN one.
// ============================================================================

// Thrown when we know, with confidence, the provider did NOT accept the
// email — either it explicitly rejected our request (a real HTTP/SMTP
// response came back saying so), or we never got far enough to attempt
// the network call at all (bad config, invalid recipient, etc). Safe to
// treat as a terminal FAILED operation: a retry is a fresh, safe attempt.
export class MailRejectedError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "MailRejectedError";
    this.cause = cause;
  }
}

// Thrown when the outcome is genuinely uncertain — the request left our
// server, but the connection died, timed out, or was reset before we
// could read a definitive response. We cannot tell whether the provider
// received/sent the email or not. MUST map to an UNKNOWN operation, never
// to an automatic retry.
export class MailUncertainError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "MailUncertainError";
    this.cause = cause;
  }
}

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST) {
    throw new MailRejectedError(
      "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in your environment."
    );
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

// Nodemailer surfaces a `responseCode` (the SMTP numeric reply code) only
// when the destination server actually replied with a permanent-failure
// response (5xx) to our DATA/RCPT command — i.e. a definite rejection we
// can be confident about. Anything else (connection refused, ETIMEDOUT,
// ECONNRESET, socket closed mid-transaction, DNS failure, etc.) means we
// never got a trustworthy final answer, so it must be treated as
// uncertain rather than assumed failed.
function classifySmtpError(err) {
  const hasDefinitiveSmtpReply =
    typeof err?.responseCode === "number" && err.responseCode >= 500 && err.responseCode < 600;
  if (hasDefinitiveSmtpReply) {
    return new MailRejectedError(`SMTP rejected the message (${err.responseCode}).`, err);
  }
  return new MailUncertainError(
    "Lost connection to the SMTP server before a delivery result was confirmed.",
    err
  );
}

async function sendViaSmtp({ to, subject, html, text }) {
  const t = getTransporter();
  let info;
  try {
    info = await t.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });
  } catch (err) {
    throw classifySmtpError(err);
  }
  return { providerMessageId: info?.messageId || null };
}

// Brevo's HTTP API — uses BREVO_API_KEY, a DIFFERENT credential from the
// SMTP key (generate it under Brevo → Settings → SMTP & API → API Keys
// tab, not the SMTP tab). SMTP_FROM is still reused as the sender
// address, so no separate "from" variable is needed for this method.
async function sendViaApi({ to, subject, html, text }) {
  if (!process.env.BREVO_API_KEY) {
    throw new MailRejectedError("BREVO_API_KEY is not set.");
  }
  if (!process.env.SMTP_FROM) {
    throw new MailRejectedError(
      "SMTP_FROM is not set (used as the sender address for both methods)."
    );
  }

  let response;
  try {
    response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { email: process.env.SMTP_FROM },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
    });
  } catch (err) {
    // fetch() itself threw — the request never got a response at all
    // (network drop, DNS failure, timeout, TLS reset). We cannot know
    // whether Brevo received and processed it before the connection
    // died. This is exactly the "unknown result" scenario: never treat
    // it as a safe-to-retry failure.
    throw new MailUncertainError(
      "Lost connection to the mail provider before a delivery result was confirmed.",
      err
    );
  }

  if (!response.ok) {
    // We DID get a response — the provider explicitly told us it did not
    // accept the email. That's a confident, definite failure.
    const body = await response.text().catch(() => "");
    throw new MailRejectedError(`Brevo API error (${response.status}): ${body}`);
  }

  const data = await response.json().catch(() => ({}));
  return { providerMessageId: data?.messageId || null };
}

export async function sendMail(payload) {
  const method = (process.env.MAIL_METHOD || "api").toLowerCase();
  if (method === "smtp") {
    return sendViaSmtp(payload);
  }
  return sendViaApi(payload);
}
