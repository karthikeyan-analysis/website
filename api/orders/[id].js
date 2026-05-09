import {
  escapeHtml,
  formatMultiline,
  getAdminEmail,
  safeSendMail,
} from "../../server/mailer.js";
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

function normalizeDate(value) {
  const date = (() => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === "string") return new Date(value);
    if (typeof value?.toDate === "function") return value.toDate();
    if (value?._seconds) return new Date(value._seconds * 1000);
    if (value?.seconds) return new Date(value.seconds * 1000);
    return null;
  })();
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function buildOrderItemsRowsHtml(items) {
  return normalizeItems(items)
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
  {
    orderId,
    customerName,
    customerEmail,
    items,
    total,
    paymentId,
    address,
    orderDate,
  },
) {
  const config = getStatusContent(status, orderId);
  const supportPhone = getSupportPhone();
  const telHref = escapeHtml(supportPhone.replace(/\s+/g, ""));
  const trackOrderUrl = getTrackOrderUrl(orderId);
  const placedAt = normalizeDate(orderDate);
  const normalized = normalizeItems(items || []);
  const itemsBodyHTML =
    normalized.length > 0
      ? buildOrderItemsRowsHtml(items || [])
      : `<tr>
        <td colspan="4" style="padding:10px;border-bottom:1px solid #ddd;color:#555;">
          Line-item details were not attached to this message. Your order total and Order ID below are still valid.
        </td>
      </tr>`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10197E;">${escapeHtml(config.label)} — update</h2>
      <p>Dear ${escapeHtml(customerName || "Customer")},</p>
      <p>${escapeHtml(config.message)}</p>

      <div style="margin:18px 0;padding:14px 16px;background:#f5f7ff;border:1px solid #cfd6f6;border-radius:6px;">
        <p style="margin:0 0 6px 0;font-size:13px;color:#334;text-transform:uppercase;letter-spacing:0.04em;">Your order ID</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#10197E;word-break:break-all;">${escapeHtml(orderId)}</p>
        <p style="margin:12px 0 0 0;font-size:14px;color:#333;">
          Always use this Order ID when you contact us or when you check your order status on our website.
        </p>
      </div>

      <p><strong>Current status:</strong> ${escapeHtml(config.label)}</p>

      <hr style="border: none; border-top: 1px solid #ddd; margin: 22px 0;">
      <h3 style="margin:0 0 12px 0;color:#10197E;">Complete order details</h3>
      ${placedAt ? `<p><strong>Order date:</strong> ${escapeHtml(placedAt.toLocaleString("en-IN"))}</p>` : ""}
      ${paymentId ? `<p><strong>Payment ID:</strong> ${escapeHtml(paymentId)}</p>` : ""}
      ${address ? `<p><strong>Delivery address:</strong><br>${formatMultiline(address)}</p>` : ""}
      ${customerEmail ? `<p><strong>Email on order:</strong> ${escapeHtml(customerEmail)}</p>` : ""}

      <table style="width: 100%; border-collapse: collapse; margin-top: 14px;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
            <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemsBodyHTML}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 8px; text-align: right; border-top: 2px solid #ddd;"><strong>Order total</strong></td>
            <td style="padding: 8px; text-align: right; border-top: 2px solid #ddd;"><strong>₹${escapeHtml(
              formatCurrency(total),
            )}</strong></td>
          </tr>
        </tfoot>
      </table>

      <div style="margin:24px 0;padding:16px 18px;background:#fafbff;border-left:4px solid #10197E;border-radius:4px;">
        <p style="margin:0 0 10px 0;"><strong>For any queries,</strong> contact us at our number:
          <a href="tel:${telHref}" style="color:#10197E;font-weight:700;">${escapeHtml(supportPhone)}</a>.
        </p>
        <p style="margin:0 0 10px 0;">
          <strong>Check your order status</strong> on our website anytime using your Order ID
          (<strong>${escapeHtml(orderId)}</strong>). Open the Track order page and enter this ID when asked.
        </p>
        <p style="margin:0;font-size:14px;">
          Direct link:
          <a href="${escapeHtml(trackOrderUrl)}" style="color:#10197E;">${escapeHtml(trackOrderUrl)}</a>
        </p>
      </div>

      <p>Thank you for shopping with us.</p>
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
          orderDate: prev.createdAt ?? prev.orderDate ?? null,
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
