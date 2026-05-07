import express from "express";
import { db } from "../config/firebase.js";
import { sendContactConfirmation, sendEmail } from "../config/email.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Submit contact form
router.post("/submit", async (req, res) => {
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

    // Save to Firestore
    const docRef = await db.collection("contacts").add({
      name,
      email,
      phone,
      subject: normalizedSubject,
      message,
      submittedAt: new Date(),
      read: false,
      ipAddress: req.ip,
    });

    // Send confirmation email to user
    await sendContactConfirmation({
      name,
      email,
      phone,
      subject: normalizedSubject,
      message,
    });

    // Send notification email to admin
    const adminHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10197E;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
        <p><strong>Subject:</strong> ${normalizedSubject}</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p><small>Submission ID: ${docRef.id}</small></p>
      </div>
    `;

    await sendEmail(
      process.env.ADMIN_EMAIL || "karthikeyananalysisstudycircle@gmail.com",
      `New Contact: ${normalizedSubject}`,
      adminHtmlContent,
    );

    res.status(201).json({
      success: true,
      message: "Contact submitted successfully",
      id: docRef.id,
    });
  } catch (error) {
    console.error("Error submitting contact:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all contacts (admin)
router.get("/", async (req, res) => {
  try {
    const snapshot = await db
      .collection("contacts")
      .orderBy("submittedAt", "desc")
      .get();

    const contacts = [];
    snapshot.forEach((doc) => {
      contacts.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: error.message });
  }
});

// Mark contact as read
router.patch("/:id/read", async (req, res) => {
  try {
    await db.collection("contacts").doc(req.params.id).update({
      read: true,
    });
    res.json({ message: "Contact marked as read" });
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete contact
router.delete("/:id", async (req, res) => {
  try {
    await db.collection("contacts").doc(req.params.id).delete();
    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
