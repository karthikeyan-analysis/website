import {
  escapeHtml,
  formatMultiline,
  getAdminEmail,
  safeSendMail,
} from "../../server/mailer.js";
import { getAdminDb } from "../../server/firebaseAdmin.js";

async function sendContactConfirmation({
  name,
  email,
  phone,
  subject,
  message,
}) {
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

  return await safeSendMail({
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

  return await safeSendMail({
    to: getAdminEmail(),
    subject: `New Contact: ${subject}`,
    html: adminHtmlContent,
    replyTo: email,
  });
}

function contactsCollection() {
  const db = getAdminDb();
  return db.collection("contacts");
}

export default async function handler(req, res) {
  // Enable CORS
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

    // Validation
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Persist to Firestore (primary source of truth)
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
    const submissionId = docRef.id;

    // Send emails (required for "received in mail").
    // We still keep the Firestore submission even if email fails, but we return an error.
    let emailStatus = { ok: true };
    try {
      const [userMail, adminMail] = await Promise.all([
        sendContactConfirmation({
          name,
          email,
          phone,
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

      const skipped =
        (userMail && userMail.skipped) || (adminMail && adminMail.skipped);
      if (skipped) {
        emailStatus = { ok: false, error: "EMAIL_NOT_CONFIGURED" };
        return res.status(500).json({
          error:
            "Saved to Firestore, but email is not configured. Set EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM, ADMIN_EMAIL in Vercel.",
          submissionId,
          emailStatus,
        });
      }
    } catch (emailError) {
      emailStatus = {
        ok: false,
        error: emailError?.message || "EMAIL_SEND_FAILED",
      };
      console.error("Email send failed:", emailError);
      return res.status(500).json({
        error:
          "Saved to Firestore, but failed to send email. Check EMAIL_USER/EMAIL_PASSWORD (use Gmail App Password) and redeploy.",
        submissionId,
        emailStatus,
      });
    }

    res.status(201).json({
      success: true,
      submissionId,
      message: "Contact form submitted successfully",
      emailStatus,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
