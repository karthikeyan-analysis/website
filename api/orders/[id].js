import {
  buildCustomerOrderStatusEmailBodyHtml,
  escapeHtml,
  getAdminEmail,
  getCustomerStatusEmailSubject,
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

function getTrackOrderUrl() {
  const base = process.env.FRONTEND_URL || "https://www.karthikeyananalysis.in";
  const safeBase = String(base).replace(/\/+$/, "");
  return `${safeBase}/track-order`;
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
  const normalized = normalizeItems(items || []);
  const itemsBodyHTML =
    normalized.length > 0
      ? buildOrderItemsRowsHtml(items || [])
      : `<tr>
        <td colspan="4" style="padding:10px;border-bottom:1px solid #ddd;color:#555;">
          Line-item details were not attached to this message. Your order total and Order ID below are still valid.
        </td>
      </tr>`;

  const supportPhone = getSupportPhone();
  const trackOrderUrl = getTrackOrderUrl();
  const htmlContent = buildCustomerOrderStatusEmailBodyHtml({
    orderId,
    customerName,
    customerEmail,
    status,
    total,
    paymentId,
    address,
    orderDate,
    itemsBodyHTML,
    supportPhone,
    trackOrderUrl,
  });

  await safeSendMail({
    to: customerEmail,
    subject: getCustomerStatusEmailSubject(status, orderId),
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
