import {
  escapeHtml,
  formatMultiline,
  getAdminEmail,
  safeSendMail,
} from "../../server/mailer.js";
import { getAdminDb } from "../../server/firebaseAdmin.js";

async function sendContactConfirmation({ name, email, subject, message }) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10197E;">Contact Form Received</h2>
      <p>Dear ${escapeHtml(name)},</p>
      <p>Thank you for reaching out to us. We have received your message and will get back to you soon.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <h3>Your Message:</h3>
      <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <p><strong>Message:</strong></p>
      <p>${formatMultiline(message)}</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p>Best regards,<br>Karthikeyan Analysis Team</p>
    </div>
  `;

  return safeSendMail({
    to: email,
    subject: `Re: ${subject} - Contact Confirmation`,
    html: htmlContent,
    replyTo: getAdminEmail(),
  });
}

async function sendAdminNotification({
  name,
  email,
  phone,
  subject,
  message,
  submissionId,
}) {
  const adminHtmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10197E;">New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      <p><strong>Phone:</strong> <a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></p>
      <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <h3>Message:</h3>
      <p>${formatMultiline(message)}</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p><small>Submission ID: ${submissionId}</small></p>
    </div>
  `;

  return safeSendMail({
    to: getAdminEmail(),
    subject: `New Contact: ${subject}`,
    html: adminHtmlContent,
    replyTo: email,
  });
}

function contactsCollection() {
  return getAdminDb().collection("contacts");
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, phone, subject, message } = req.body || {};
    const normalizedSubject =
      typeof subject === "string" && subject.trim().length > 0
        ? subject.trim()
        : "New contact form submission";

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    let submissionId = `contact_${Date.now()}`;
    let persistence = { ok: true, source: "firestore" };

    try {
      const docRef = await contactsCollection().add({
        name,
        email,
        phone,
        subject: normalizedSubject,
        message,
        submittedAt: new Date().toISOString(),
        read: false,
        ipAddress:
          (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim() ||
          req.socket?.remoteAddress ||
          "",
        userAgent: req.headers["user-agent"] || "",
      });
      submissionId = docRef.id;
    } catch (persistError) {
      persistence = {
        ok: false,
        source: "mail_only",
        error: persistError?.message || "FIRESTORE_SAVE_FAILED",
      };
      console.error("Contact save failed:", persistError);
    }

    const [userMailRes, adminMailRes] = await Promise.allSettled([
      sendContactConfirmation({
        name,
        email,
        subject: normalizedSubject,
        message,
      }),
      sendAdminNotification({
        name,
        email,
        phone,
        subject: normalizedSubject,
        message,
        submissionId,
      }),
    ]);

    const toEmailResult = (result) =>
      result.status === "fulfilled"
        ? {
            ok: !result.value?.skipped,
            skipped: !!result.value?.skipped,
            reason: result.value?.reason || "",
            messageId: result.value?.messageId || "",
          }
        : {
            ok: false,
            skipped: false,
            reason: result.reason?.message || "EMAIL_SEND_FAILED",
          };

    const emailStatus = {
      user: toEmailResult(userMailRes),
      admin: toEmailResult(adminMailRes),
    };

    const anyMailWorked = emailStatus.user.ok || emailStatus.admin.ok;

    if (!persistence.ok && !anyMailWorked) {
      return res.status(500).json({
        error:
          "Failed to save contact and send emails. Check Firebase server env and SMTP env in Vercel.",
        submissionId,
        persistence,
        emailStatus,
        fixChecklist: [
          "Vercel → Project → Settings → Environment Variables (Production): FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY or FIREBASE_PRIVATE_KEY_BASE64.",
          "Same place: EMAIL_USER (or SMTP_USER), EMAIL_PASSWORD, EMAIL_FROM, ADMIN_EMAIL.",
          "Ensure `.vercelignore` does NOT exclude the `server/` folder (it contains firebaseAdmin + mailer used by all API routes).",
          "Redeploy after changing env vars.",
          "If emails still fail with Gmail: enable 2FA and use an App Password.",
        ],
      });
    }

    res.status(201).json({
      success: true,
      submissionId,
      message: "Contact form submitted successfully",
      warning:
        !persistence.ok || !emailStatus.user.ok || !emailStatus.admin.ok
          ? "Partial success. Check email/firestore status fields."
          : "",
      persistence,
      emailStatus,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
