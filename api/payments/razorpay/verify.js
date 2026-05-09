import crypto from "crypto";
import { getAdminDb } from "../../_lib/firebaseAdmin.js";
import {
  getAdminEmail,
  safeSendMail,
  escapeHtml,
  formatMultiline,
} from "../../_lib/mailer.js";

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
  const itemsHTML = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${escapeHtml(item.name)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${escapeHtml(item.quantity)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${escapeHtml(item.price)}</td>
    </tr>
  `,
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
      <h2 style="color: #10197E;">Order Confirmation</h2>
      <p>Dear ${escapeHtml(customerName)},</p>
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
            <td style="padding: 8px; text-align: right;"><strong>₹${escapeHtml(total)}</strong></td>
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

async function sendAdminOrderEmail({ orderId, customerName, customerEmail, items, total, address }) {
  const itemsHTML = items
    .map(
      (item) => `
      <li>${escapeHtml(item.name)} × ${escapeHtml(item.quantity)} (₹${escapeHtml(item.price)})</li>
    `,
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
      <h2 style="color:#10197E;">New Paid Order</h2>
      <p><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>
      <p><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(customerEmail)}">${escapeHtml(customerEmail)}</a></p>
      ${address ? `<p><strong>Address:</strong><br>${formatMultiline(address)}</p>` : ""}
      <hr style="border:none;border-top:1px solid #ddd;margin:16px 0;" />
      <p><strong>Items:</strong></p>
      <ul>${itemsHTML}</ul>
      <p style="text-align:right;"><strong>Total:</strong> ₹${escapeHtml(total)}</p>
    </div>
  `;

  await safeSendMail({
    to: getAdminEmail(),
    subject: `New Paid Order: ${orderId}`,
    html,
    replyTo: customerEmail,
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
    } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment fields" });
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    const customerName = customer?.name || "";
    const customerEmail = customer?.email || "";
    const customerPhone = customer?.phone || "";
    if (!customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({ error: "Missing customer details" });
    }

    const items = normalizeItems(cart);
    if (items.length < 1) return res.status(400).json({ error: "Order must contain items" });

    const orderTotal = Number(total);
    if (!Number.isFinite(orderTotal) || orderTotal <= 0) {
      return res.status(400).json({ error: "Invalid total" });
    }

    const db = getAdminDb();
    const orderId = `rp_${razorpay_order_id}`;
    const ref = db.collection("orders").doc(orderId);
    const existing = await ref.get();
    if (existing.exists) {
      return res.status(200).json({ success: true, orderId });
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
      total: orderTotal,
      address: address || "",
      status: "paid",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ref.set(record);

    await Promise.all([
      sendOrderConfirmationEmail({
        orderId,
        customerName,
        customerEmail,
        items,
        total: orderTotal,
      }),
      sendAdminOrderEmail({
        orderId,
        customerName,
        customerEmail,
        items,
        total: orderTotal,
        address: address || "",
      }),
    ]);

    res.status(200).json({ success: true, orderId });
  } catch (error) {
    console.error("Razorpay verify error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

