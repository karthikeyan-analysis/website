import { escapeHtml, getAdminEmail, safeSendMail } from "../../server/mailer.js";
import { getAdminDb } from "../../server/firebaseAdmin.js";

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

function formatCurrency(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return "0.00";
  return amount.toFixed(2);
}

function getSupportPhone() {
  return process.env.SUPPORT_PHONE || process.env.ADMIN_PHONE || "+91 63859 39895";
}

function getTrackOrderUrl(orderId) {
  const base = process.env.FRONTEND_URL || "https://www.karthikeyananalysis.in";
  const safeBase = String(base).replace(/\/+$/, "");
  const id = encodeURIComponent(String(orderId || "").trim());
  return `${safeBase}/track-order/${id}`;
}

function getStatusContent(status, orderId) {
  const normalized = String(status || "").trim().toLowerCase();
  const byStatus = {
    pending: {
      subject: `Your Order Is Pending - ${orderId}`,
      label: "Pending",
      message:
        "Your order is confirmed and currently pending processing. We will ship it soon.",
    },
    paid: {
      subject: `Payment Received - ${orderId}`,
      label: "Paid",
      message:
        "We have received payment for your order. Our team is preparing your shipment.",
    },
    shipped: {
      subject: `Your Order Has Been Shipped - ${orderId}`,
      label: "Shipped",
      message: "Your order has been shipped and is on its way to you.",
    },
    cancelled_waiting_refund: {
      subject: `Your Order Has Been Cancelled - ${orderId}`,
      label: "Cancelled (Waiting to be refunded)",
      message:
        "Your order has been cancelled and refund is being processed.",
    },
    cancelled: {
      subject: `Your Order Has Been Cancelled - ${orderId}`,
      label: "Cancelled (Waiting to be refunded)",
      message:
        "Your order has been cancelled and refund is being processed.",
    },
    cancelled_refunded: {
      subject: `Refund Processed - ${orderId}`,
      label: "Cancelled and Refunded",
      message: "Your order has been cancelled and refund has been completed.",
    },
  };
  return (
    byStatus[normalized] || {
      subject: `Order Status Updated - ${orderId}`,
      label: status || "Updated",
      message: "Your order status has been updated.",
    }
  );
}

async function sendOrderStatusEmail(
  status,
  { orderId, customerName, customerEmail, items, total, paymentId, address },
) {
  const config = getStatusContent(status, orderId);
  const supportPhone = getSupportPhone();
  const trackOrderUrl = getTrackOrderUrl(orderId);
  const itemsRows = normalizeItems(items)
    .map((item) => {
      const qty = Number(item.quantity || 0);
      const price = Number(item.price || 0);
      const subtotal = qty * price;
      return `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${escapeHtml(item.name)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${escapeHtml(qty)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${escapeHtml(formatCurrency(price))}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${escapeHtml(formatCurrency(subtotal))}</td>
      </tr>`;
    })
    .join("");

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10197E;">Order Status Update</h2>
      <p>Dear ${escapeHtml(customerName)},</p>
      <p>${escapeHtml(config.message)}</p>
      <p><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>
      <p><strong>Status:</strong> ${escapeHtml(config.label)}</p>
      <p><strong>Total:</strong> ₹${escapeHtml(formatCurrency(total))}</p>
      ${paymentId ? `<p><strong>Payment ID:</strong> ${escapeHtml(paymentId)}</p>` : ""}
      ${address ? `<p><strong>Delivery Address:</strong> ${escapeHtml(address)}</p>` : ""}
      ${
        itemsRows
          ? `<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
            <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>`
          : ""
      }
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p><strong>Track your order:</strong> Use this order ID on our website.</p>
      <p>
        Track link:
        <a href="${escapeHtml(trackOrderUrl)}">${escapeHtml(trackOrderUrl)}</a>
      </p>
      <p>If you have any queries, call us at <a href="tel:${escapeHtml(
        supportPhone.replace(/\s+/g, ""),
      )}">${escapeHtml(supportPhone)}</a>.</p>
      <p>Best regards,<br>Karthikeyan Analysis Team</p>
    </div>
  `;

  await safeSendMail({
    to: customerEmail,
    subject: config.subject,
    html: htmlContent,
    replyTo: getAdminEmail(),
  });
}

function ordersCollection() {
  const db = getAdminDb();
  return db.collection("orders");
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

  try {
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid order id" });
    }

    if (req.method === "GET") {
      const snap = await ordersCollection().doc(id).get();
      if (!snap.exists) return res.status(404).json({ error: "Order not found" });
      res.status(200).json({ id: snap.id, ...snap.data() });
    } else if (req.method === "PUT") {
      // Update order status
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      const ref = ordersCollection().doc(id);
      const snap = await ref.get();
      if (!snap.exists) return res.status(404).json({ error: "Order not found" });

      const prev = snap.data();
      await ref.set(
        {
          ...prev,
          status,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      // Send status update email (optional - will skip if not configured)
      if (
        ["pending", "paid", "shipped", "cancelled_waiting_refund", "cancelled_refunded", "cancelled"].includes(
          String(status).toLowerCase(),
        )
      ) {
        await sendOrderStatusEmail(status, {
          orderId: id,
          customerName: prev.customerName,
          customerEmail: prev.customerEmail,
          items: prev.items || [],
          total: prev.total || 0,
          paymentId: prev.razorpay_payment_id || "",
          address: prev.address || "",
        });
      }

      res
        .status(200)
        .json({ success: true, message: "Order updated successfully" });
    } else if (req.method === "DELETE") {
      const ref = ordersCollection().doc(id);
      const snap = await ref.get();
      if (!snap.exists) return res.status(404).json({ error: "Order not found" });
      await ref.delete();
      res
        .status(200)
        .json({ success: true, message: "Order deleted successfully" });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
