import nodemailer from "nodemailer";

// ============================================================================
// SMTP MAILER
// Generic — works with any SMTP provider by just changing env vars, no
// code changes. For production on a real domain, a transactional-email
// provider's SMTP relay is the standard choice (much better inbox
// deliverability than sending straight from a generic mail server):
//   - Brevo (formerly Sendinblue): 300 emails/day free, forever
//   - Amazon SES: extremely cheap at scale, needs domain verification
//   - Mailgun / Postmark / Resend: all have usable free/low tiers
// Gmail SMTP + an App Password technically works too, but is rate-limited
// and not really meant for production transactional mail — fine for
// initial testing only.
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
    // Port 465 requires implicit TLS from the start of the connection;
    // every other common port (587, 25) upgrades to TLS via STARTTLS
    // instead, which nodemailer handles automatically when secure:false.
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

export async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  await t.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}
