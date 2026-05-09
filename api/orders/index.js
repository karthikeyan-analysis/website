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

function buildOrderItemsTable(items) {
  return items
    .map((item) => {
      const qty = Number(item.quantity || 0);
      const price = Number(item.price || 0);
      const lineTotal = qty * price;
      return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #ddd;">${escapeHtml(item.name)}</td>
          <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">${escapeHtml(qty)}</td>
          <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">₹${escapeHtml(formatCurrency(price))}</td>
          <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">₹${escapeHtml(formatCurrency(lineTotal))}</td>
        </tr>
      `;
    })
    .join("");
}

function formatHumanOrderStatus(status) {
  const n = String(status || "").trim().toLowerCase();
  switch (n) {
    case "paid":
      return "Paid";
    case "pending":
      return "Pending";
    case "shipped":
      return "Shipped";
    case "cancelled_waiting_refund":
      return "Cancelled (Waiting to be refunded)";
    case "cancelled_refunded":
      return "Cancelled and Refunded";
    case "cancelled":
      return "Cancelled (Waiting to be refunded)";
    default:
      return String(status || "Paid").trim() || "Paid";
  }
}

function getCustomerStatusEmailHeadline(status) {
  const n = String(status || "").trim().toLowerCase();
  switch (n) {
    case "paid":
      return "Payment confirmed";
    case "pending":
      return "Your order is pending processing";
    case "shipped":
      return "Your order has been shipped!";
    case "cancelled_waiting_refund":
    case "cancelled":
      return "Your order has been cancelled";
    case "cancelled_refunded":
      return "Your refund has been completed";
    default:
      return "Order status update";
  }
}

function getCustomerStatusEmailSubject(status, orderId) {
  const sid = String(orderId || "")
    .trim()
    .replace(/[\r\n]+/g, " ")
    .slice(0, 90);
  const n = String(status || "").trim().toLowerCase();
  switch (n) {
    case "shipped":
      return `${sid}: Your order has been shipped`;
    case "paid":
      return `${sid}: Order & payment confirmed`;
    case "pending":
      return `${sid}: Order is pending`;
    case "cancelled_waiting_refund":
    case "cancelled":
      return `${sid}: Order cancelled — refund pending`;
    case "cancelled_refunded":
      return `${sid}: Refund completed`;
    default:
      return `${sid}: Order status updated`;
  }
}

function getStatusContent(status) {
  const normalized = String(status || "").trim().toLowerCase();
  switch (normalized) {
    case "pending":
      return {
        label: "Pending",
        summary:
          "Your order is confirmed and currently pending processing. Our team will prepare and dispatch it soon.",
      };
    case "paid":
      return {
        label: "Paid",
        summary:
          "Payment is successful and your order is now in processing. We will notify you once it is shipped.",
      };
    case "shipped":
      return {
        label: "Shipped",
        summary: "Your order has been shipped and is on the way to your delivery address.",
      };
    case "cancelled_waiting_refund":
    case "cancelled":
      return {
        label: "Cancelled (Waiting to be refunded)",
        summary:
          "Your order has been cancelled and refund is being processed. Please allow some time for the refund to reflect.",
      };
    case "cancelled_refunded":
      return {
        label: "Cancelled and Refunded",
        summary: "Your order has been cancelled and refund has been completed.",
      };
    default:
      return {
        label: status || "Updated",
        summary: "Your order status has been updated.",
      };
  }
}

async function sendOrderConfirmation({
  orderId,
  customerName,
  customerEmail,
  items,
  total,
  orderDate,
  paymentId,
  address,
  orderStatusLabel,
}) {
  const itemsHTML = buildOrderItemsTable(items);
  const placedAt = normalizeDate(orderDate) || new Date();
  const supportPhone = getSupportPhone();
  const trackOrderUrl = getTrackOrderUrl(orderId);
  const statusHuman = formatHumanOrderStatus(orderStatusLabel);

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10197E;">Thank you — your order is confirmed</h2>
      <p>Dear ${escapeHtml(customerName)},</p>
      <p>Thank you for your order at Karthikeyan Analysis. We have received your purchase and will process it shortly.</p>
      <p><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>
      <p><strong>Order Date:</strong> ${escapeHtml(
        placedAt.toLocaleString("en-IN"),
      )}</p>
      <p><strong>Current status:</strong> ${escapeHtml(statusHuman)}</p>
      ${
        paymentId
          ? `<p><strong>Payment ID:</strong> ${escapeHtml(paymentId)}</p>`
          : ""
      }
      ${address ? `<p><strong>Delivery Address:</strong><br>${formatMultiline(address)}</p>` : ""}
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <h3>Order Details:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
            <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemsHTML}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 8px; text-align: right;"><strong>Total:</strong></td>
            <td style="padding: 8px; text-align: right;"><strong>₹${escapeHtml(
              formatCurrency(total),
            )}</strong></td>
          </tr>
        </tfoot>
      </table>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p><strong>Track your order:</strong> Use this Order ID on our website to track status.</p>
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

  return safeSendMail({
    to: customerEmail,
    subject: `Order confirmed • ${orderId}`,
    html: htmlContent,
    replyTo: getAdminEmail(),
  });
}

async function sendAdminOrderNotification({
  orderId,
  customerName,
  customerEmail,
  items,
  total,
  address,
}) {
  const itemsHTML = items
    .map(
      (item) => `
      <li>${escapeHtml(item.name)} × ${escapeHtml(item.quantity)} (₹${escapeHtml(item.price)})</li>
    `,
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
      <h2 style="color:#10197E;">New Order Received</h2>
      <p><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>
      <p><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(customerEmail)}">${escapeHtml(customerEmail)}</a></p>
      ${
        address
          ? `<p><strong>Address:</strong><br>${formatMultiline(address)}</p>`
          : ""
      }
      <hr style="border:none;border-top:1px solid #ddd;margin:16px 0;" />
      <p><strong>Items:</strong></p>
      <ul>${itemsHTML}</ul>
      <p style="text-align:right;"><strong>Total:</strong> ₹${escapeHtml(
        formatCurrency(total),
      )}</p>
    </div>
  `;

  return safeSendMail({
    to: getAdminEmail(),
    subject: `New Order: ${orderId}`,
    html,
    replyTo: customerEmail,
  });
}

async function sendOrderStatusEmail({
  orderId,
  customerName,
  customerEmail,
  items,
  status,
  total,
  paymentId,
  address,
  orderDate,
}) {
  const statusInfo = getStatusContent(status);
  const headline = getCustomerStatusEmailHeadline(status);
  const emailSubject = getCustomerStatusEmailSubject(status, orderId);
  const itemsHTML = buildOrderItemsTable(Array.isArray(items) ? items : []);
  const supportPhone = getSupportPhone();
  const trackOrderUrl = getTrackOrderUrl(orderId);
  const placedAt = normalizeDate(orderDate);
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10197E;">${escapeHtml(headline)}</h2>
      <p>Dear ${escapeHtml(customerName || "Customer")},</p>
      <p>Your order <strong>${escapeHtml(orderId)}</strong> status is now:</p>
      <p style="font-size: 16px; font-weight: 700; color: #10197E;">${escapeHtml(
        statusInfo.label,
      )}</p>
      <p>${escapeHtml(statusInfo.summary)}</p>
      ${placedAt ? `<p><strong>Order Date:</strong> ${escapeHtml(placedAt.toLocaleString("en-IN"))}</p>` : ""}
      <p><strong>Total:</strong> ₹${escapeHtml(formatCurrency(total))}</p>
      ${paymentId ? `<p><strong>Payment ID:</strong> ${escapeHtml(paymentId)}</p>` : ""}
      ${address ? `<p><strong>Delivery Address:</strong><br>${formatMultiline(address)}</p>` : ""}
      ${
        itemsHTML
          ? `
      <h3 style="margin-top:18px;">Order Details:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
            <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemsHTML}</tbody>
      </table>
      `
          : ""
      }
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p><strong>Track your order:</strong> Use this Order ID on our website to track status.</p>
      <p>
        Track link:
        <a href="${escapeHtml(trackOrderUrl)}">${escapeHtml(trackOrderUrl)}</a>
      </p>
      <p>If you have any queries, call us at <a href="tel:${escapeHtml(
        supportPhone.replace(/\s+/g, ""),
      )}">${escapeHtml(supportPhone)}</a>.</p>
      <p>Thank you for shopping with us.</p>
      <p>Best regards,<br>Karthikeyan Analysis Team</p>
    </div>
  `;

  return safeSendMail({
    to: customerEmail,
    subject: emailSubject,
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
    if (req.method === "GET") {
      const snap = await ordersCollection().orderBy("createdAt", "desc").get();
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      res.status(200).json(rows);
    } else if (req.method === "POST") {
      const { _action } = req.body || {};

      if (_action === "sendConfirmationEmail") {
        const order = req.body?.order || {};
        const orderId = String(order.id || "").trim();
        const customerName = String(order.customerName || "").trim();
        const customerEmail = String(order.customerEmail || "").trim();
        const total = Number(order.total || 0);
        const items = normalizeItems(order.items || []);
        const address = String(order.address || "").trim();

        if (!orderId || !customerEmail || items.length < 1 || !total) {
          return res.status(400).json({ error: "Invalid order payload for email" });
        }

        const [customerResult, adminResult] = await Promise.all([
          sendOrderConfirmation({
            orderId,
            customerName,
            customerEmail,
            items,
            total,
            orderDate: order.createdAt || new Date(),
            paymentId: order.razorpay_payment_id || "",
            address,
            orderStatusLabel: order.status || "Paid",
          }),
          sendAdminOrderNotification({
            orderId,
            customerName,
            customerEmail,
            items,
            total,
            address,
          }),
        ]);

        return res.status(200).json({
          success: true,
          emailSent: !customerResult?.skipped,
          customerEmailResult: customerResult,
          adminEmailResult: adminResult,
        });
      }

      if (_action === "sendStatusEmail") {
        const order = req.body?.order || {};
        const status = String(req.body?.status || order.status || "Updated").trim();
        const orderId = String(order.id || "").trim();
        const customerName = String(order.customerName || "").trim();
        const customerEmail = String(order.customerEmail || "").trim();
        const address = String(order.address || "").trim();
        const paymentId = String(order.razorpay_payment_id || "").trim();
        const total = Number(order.total || 0);

        if (!orderId || !customerEmail) {
          return res.status(400).json({ error: "Invalid status email payload" });
        }

        const result = await sendOrderStatusEmail({
          orderId,
          customerName,
          customerEmail,
          items: normalizeItems(order.items || []),
          status,
          total,
          paymentId,
          address,
          orderDate: order.createdAt || order.orderDate || null,
        });
        return res.status(200).json({
          success: true,
          emailSent: !result?.skipped,
          customerEmailResult: result,
        });
      }

      // Create order
      const { customerName, customerEmail, items, total, address } = req.body;

      if (!customerName || !customerEmail || !items || !total) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const normalizedItems = normalizeItems(items);
      if (normalizedItems.length < 1) {
        return res.status(400).json({ error: "Order must contain items" });
      }

      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newOrder = {
        id: orderId,
        customerName,
        customerEmail,
        items: normalizedItems,
        total,
        address: address || "",
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await ordersCollection().doc(orderId).set(newOrder);

      // Send order confirmation email (optional - will skip if not configured)
      const [customerResult, adminResult] = await Promise.all([
        sendOrderConfirmation({
          orderId,
          customerName,
          customerEmail,
          items: normalizedItems,
          total,
          orderDate: new Date(),
          paymentId: "",
          address: address || "",
          orderStatusLabel: "pending",
        }),
        sendAdminOrderNotification({
          orderId,
          customerName,
          customerEmail,
          items: normalizedItems,
          total,
          address: address || "",
        }),
      ]);

      res.status(201).json({
        success: true,
        orderId,
        emailSent: !customerResult?.skipped,
        customerEmailResult: customerResult,
        adminEmailResult: adminResult,
        message: "Order created successfully",
      });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
