import crypto from "crypto";
import { getAdminDb } from "../../../server/firebaseAdmin.js";
import {
  getAdminEmail,
  safeSendMail,
  escapeHtml,
  formatMultiline,
} from "../../../server/mailer.js";

function normalizeItems(rawItems) {
  if (!Array.isArray(rawItems)) return [];
  return rawItems
    .map((item) => ({
      name: item?.name ?? item?.title ?? "",
      quantity:
        Number(item?.quantity ?? item?.qty ?? item?.count ?? 1) > 0
          ? Number(item?.quantity ?? item?.qty ?? item?.count ?? 1)
          : 1,
      price: Number(item?.price ?? 0),
    }))
    .filter((i) => String(i.name).trim().length > 0);
}

async function sendOrderConfirmationEmail({ orderId, customerName, customerEmail, items, total }) {
  if (!customerEmail) return; // can't send without email
  const itemsHTML = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${escapeHtml(item.name)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${escapeHtml(String(item.quantity))}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${escapeHtml(String(item.price))}</td>
    </tr>
  `,
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
      <h2 style="color: #10197E;">Order Confirmation</h2>
      <p>Dear ${escapeHtml(customerName || "Customer")},</p>
      <p>Thank you for your order! We have received your payment successfully.</p>
      <p><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;">
      <h3>Order Details:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
            <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHTML}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 8px; text-align: right;"><strong>Total:</strong></td>
            <td style="padding: 8px; text-align: right;"><strong>₹${escapeHtml(String(total))}</strong></td>
          </tr>
        </tfoot>
      </table>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;">
      <p>We will process and ship your order soon.</p>
      <p>Best regards,<br>Karthikeyan Analysis Team</p>
    </div>
  `;

  await safeSendMail({
    to: customerEmail,
    subject: `Order Confirmation - ${orderId}`,
    html,
    replyTo: getAdminEmail(),
  });
}

async function sendAdminOrderEmail({ orderId, customerName, customerEmail, items, total, address, needsReview, razorpay_payment_id }) {
  const itemsHTML = items.length
    ? items
        .map(
          (item) => `
      <li>${escapeHtml(item.name)} × ${escapeHtml(String(item.quantity))} (₹${escapeHtml(String(item.price))})</li>
    `,
        )
        .join("")
    : "<li><em>Item details not captured — check cart in Razorpay dashboard.</em></li>";

  const reviewBanner = needsReview
    ? `<div style="background:#fef3c7;border:1px solid #d97706;border-radius:6px;padding:12px;margin-bottom:16px;">
        <strong style="color:#92400e;">⚠️ ACTION NEEDED — Order saved with incomplete customer details</strong><br>
        <span style="color:#78350f;font-size:13px;">Customer name/email/phone may be missing. Please contact this customer via Razorpay dashboard using Payment ID: <code>${escapeHtml(razorpay_payment_id || "")}</code></span>
      </div>`
    : "";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
      ${reviewBanner}
      <h2 style="color:#10197E;">New Paid Order</h2>
      <p><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>
      <p><strong>Payment ID:</strong> ${escapeHtml(razorpay_payment_id || "N/A")}</p>
      <p><strong>Customer:</strong> ${escapeHtml(customerName || "(missing)")}</p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(customerEmail || "")}">${escapeHtml(customerEmail || "(missing)")}</a></p>
      ${address ? `<p><strong>Address:</strong><br>${formatMultiline(address)}</p>` : ""}
      <hr style="border:none;border-top:1px solid #ddd;margin:16px 0;" />
      <p><strong>Items:</strong></p>
      <ul>${itemsHTML}</ul>
      <p style="text-align:right;"><strong>Total:</strong> ₹${escapeHtml(String(total))}</p>
    </div>
  `;

  await safeSendMail({
    to: getAdminEmail(),
    subject: needsReview
      ? `[ACTION NEEDED] New Order (incomplete data): ${orderId}`
      : `New Paid Order: ${orderId}`,
    html,
    replyTo: customerEmail || getAdminEmail(),
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Accept, Content-Type, Date, X-Api-Version",
  );

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return res.status(500).json({ error: "Razorpay is not configured" });

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customer,
      cart,
      address,
      total,
      userId,
      userEmail,
    } = req.body || {};

    // ── Validate payment IDs are present ─────────────────────────────────────
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment fields" });
    }

    // ── Verify HMAC signature — this is the security gate ───────────────────
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // ── Signature is valid — payment is REAL. From here we MUST save the order.
    // NEVER return an error that prevents saving — even if customer data is incomplete.

    // Normalize customer fields — use whatever we have, fill blanks with empty string
    const customerName = String(customer?.name || "").trim();
    const customerEmail = String(customer?.email || "").trim().toLowerCase();
    const customerPhone = String(customer?.phone || "").trim();

    // Flag the order if critical customer info is missing (so admin can follow up)
    const needsReview = !customerName || !customerEmail || !customerPhone;

    const items = normalizeItems(cart);
    const orderTotal = Number(total);
    // If total is invalid, try to derive from items, fallback to 0
    const safeTotal = Number.isFinite(orderTotal) && orderTotal > 0
      ? orderTotal
      : items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const db = getAdminDb();

    // ── Primary idempotency: check by Razorpay Order ID ──────────────────────
    const orderId = `rp_${razorpay_order_id}`;
    const ref = db.collection("orders").doc(orderId);
    const existing = await ref.get();
    if (existing.exists) {
      // Order already saved — idempotent response
      return res.status(200).json({ success: true, orderId });
    }

    // ── Secondary idempotency: check by Payment ID (prevents double-save) ───
    // This catches the rare case where a retry comes in with a new razorpay_order_id
    // but the same payment_id (shouldn't happen normally, but belt-and-suspenders).
    try {
      const dupSnap = await db
        .collection("orders")
        .where("razorpay_payment_id", "==", razorpay_payment_id)
        .limit(1)
        .get();
      if (!dupSnap.empty) {
        const existingOrderId = dupSnap.docs[0].id;
        return res.status(200).json({ success: true, orderId: existingOrderId });
      }
    } catch (dupCheckErr) {
      // Non-fatal — proceed with the primary orderId
      console.warn("Secondary idempotency check failed (non-fatal):", dupCheckErr?.message);
    }

    const record = {
      id: orderId,
      provider: "razorpay",
      razorpay_order_id,
      razorpay_payment_id,
      customerName,
      customerEmail,
      customerPhone,
      items,
      total: safeTotal,
      address: address || "",
      status: "paid",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Admin-facing flags
      ...(needsReview ? { needsReview: true } : {}),
      ...(userId ? { userId: String(userId) } : {}),
      ...(userEmail ? { userId_email: String(userEmail).toLowerCase() } : {}),
    };

    // ── Write to Firestore — this is the point of no return ──────────────────
    await ref.set(record);

    // Respond to client immediately — don't block on email
    res.status(200).json({ success: true, orderId });

    // ── Send emails after the response ───────────────────────────────────────
    // Cap at 8 s so we never blow Vercel's function timeout budget.
    try {
      await Promise.race([
        Promise.all([
          sendOrderConfirmationEmail({
            orderId,
            customerName,
            customerEmail,
            items,
            total: safeTotal,
          }),
          sendAdminOrderEmail({
            orderId,
            customerName,
            customerEmail,
            items,
            total: safeTotal,
            address: address || "",
            needsReview,
            razorpay_payment_id,
          }),
        ]),
        new Promise((resolve) => setTimeout(resolve, 8000)),
      ]);
    } catch (emailErr) {
      console.error("Order emails failed (order was saved successfully):", orderId, emailErr);
    }
  } catch (error) {
    console.error("Razorpay verify error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
