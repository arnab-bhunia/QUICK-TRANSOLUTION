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
// active — same function signature either way.
// ============================================================================

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST) {
    throw new Error(
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

async function sendViaSmtp({ to, subject, html, text }) {
  const t = getTransporter();
  await t.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}

// Brevo's HTTP API — uses BREVO_API_KEY, a DIFFERENT credential from the
// SMTP key (generate it under Brevo → Settings → SMTP & API → API Keys
// tab, not the SMTP tab). SMTP_FROM is still reused as the sender
// address, so no separate "from" variable is needed for this method.
async function sendViaApi({ to, subject, html, text }) {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not set.");
  }
  if (!process.env.SMTP_FROM) {
    throw new Error("SMTP_FROM is not set (used as the sender address for both methods).");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
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

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Brevo API error (${response.status}): ${body}`);
  }
}

export async function sendMail(payload) {
  const method = (process.env.MAIL_METHOD || "api").toLowerCase();
  if (method === "smtp") {
    return sendViaSmtp(payload);
  }
  return sendViaApi(payload);
}