import nodemailer from "nodemailer";

function normalizeNewlines(value) {
  return String(value ?? "").replace(/\r\n/g, "\n");
}

function stripWrappingQuotes(value) {
  return String(value ?? "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

function firstDefinedEnv(names) {
  for (const name of names) {
    const value = stripWrappingQuotes(process.env[name]);
    if (value) return value;
  }
  return "";
}

export function getAdminEmail() {
  return firstDefinedEnv(["ADMIN_EMAIL"]) || "karthikeyananalysisstudycircle@gmail.com";
}

export function getFromEmail() {
  return (
    firstDefinedEnv(["EMAIL_FROM", "SMTP_FROM", "MAIL_FROM"]) ||
    firstDefinedEnv(["EMAIL_USER", "SMTP_USER", "MAIL_USER"]) ||
    undefined
  );
}

export function getReplyToEmail() {
  return (
    firstDefinedEnv(["EMAIL_REPLY_TO", "REPLY_TO_EMAIL"]) ||
    firstDefinedEnv(["EMAIL_USER", "SMTP_USER", "MAIL_USER"]) ||
    undefined
  );
}

export function isEmailConfigured() {
  return Boolean(getNormalizedUser() && getNormalizedPassword());
}

function getNormalizedPassword() {
  // Google App Passwords are often copied with spaces; SMTP auth requires no spaces.
  return firstDefinedEnv([
    "EMAIL_PASSWORD",
    "EMAIL_PASS",
    "SMTP_PASSWORD",
    "SMTP_PASS",
    "MAIL_PASSWORD",
    "MAIL_PASS",
    "GMAIL_APP_PASSWORD",
  ]).replace(/\s+/g, "");
}

function getNormalizedUser() {
  return firstDefinedEnv([
    "EMAIL_USER",
    "SMTP_USER",
    "MAIL_USER",
    "GMAIL_USER",
    "GMAIL_EMAIL",
  ]);
}

function getSmtpHost() {
  return firstDefinedEnv(["SMTP_HOST"]) || "smtp.gmail.com";
}

function getSmtpPort() {
  const p = Number(firstDefinedEnv(["SMTP_PORT"]) || 465);
  return Number.isFinite(p) && p > 0 ? p : 465;
}

function getSmtpSecure(port) {
  const override = firstDefinedEnv(["SMTP_SECURE"]);
  if (override) return override.toLowerCase() === "true";
  return Number(port) === 465;
}

function htmlToText(html) {
  return String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function getTransporter() {
  if (!isEmailConfigured()) return null;

  // Cache across invocations when possible (warm lambda)
  const cacheKey = `${getNormalizedUser()}:${getNormalizedPassword()}`;
  if (globalThis.__ka_mailer && globalThis.__ka_mailer_key === cacheKey) {
    return globalThis.__ka_mailer;
  }

  const port = getSmtpPort();
  const transporter = nodemailer.createTransport({
    host: getSmtpHost(),
    port,
    secure: getSmtpSecure(port),
    auth: {
      user: getNormalizedUser(),
      pass: getNormalizedPassword(),
    },
  });

  globalThis.__ka_mailer = transporter;
  globalThis.__ka_mailer_key = cacheKey;
  return transporter;
}

export async function safeSendMail({ to, subject, html, replyTo }) {
  const transporter = getTransporter();
  if (!transporter) return { skipped: true, reason: "EMAIL_NOT_CONFIGURED" };

  const from = getFromEmail();
  if (!from) return { skipped: true, reason: "EMAIL_FROM_NOT_SET" };

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text: htmlToText(html),
    replyTo: replyTo || getReplyToEmail(),
  });

  return { skipped: false, messageId: info.messageId };
}

export function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function formatMultiline(text) {
  return escapeHtml(normalizeNewlines(text)).replace(/\n/g, "<br>");
}
