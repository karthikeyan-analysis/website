import nodemailer from "nodemailer";

function normalizeNewlines(value) {
  return String(value ?? "").replace(/\r\n/g, "\n");
}

export function getAdminEmail() {
  return process.env.ADMIN_EMAIL || "karthikeyananalysisstudycircle@gmail.com";
}

export function getFromEmail() {
  return process.env.EMAIL_FROM || process.env.EMAIL_USER || undefined;
}

export function getReplyToEmail() {
  return process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER || undefined;
}

export function isEmailConfigured() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
}

export function getTransporter() {
  if (!isEmailConfigured()) return null;

  // Cache across invocations when possible (warm lambda)
  if (globalThis.__ka_mailer) return globalThis.__ka_mailer;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  globalThis.__ka_mailer = transporter;
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

