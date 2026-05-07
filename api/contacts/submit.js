import {
  escapeHtml,
  formatMultiline,
  getAdminEmail,
  safeSendMail,
} from "../_lib/mailer.js";

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

  await safeSendMail({
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

  await safeSendMail({
    to: getAdminEmail(),
    subject: `New Contact: ${subject}`,
    html: adminHtmlContent,
    replyTo: email,
  });
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

    // Generate submission ID locally
    const submissionId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Send emails (optional - will skip if not configured)
    await Promise.all([
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

    res.status(201).json({
      success: true,
      submissionId,
      message: "Contact form submitted successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
