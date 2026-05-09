import {
  escapeHtml,
  formatMultiline,
  getAdminEmail,
  safeSendMail,
} from "../_lib/mailer.js";
import { getAdminDb } from "../_lib/firebaseAdmin.js";

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

async function sendOrderConfirmation({
  orderId,
  customerName,
  customerEmail,
  items,
  total,
  orderDate,
}) {
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

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10197E;">Order Confirmation</h2>
      <p>Dear ${escapeHtml(customerName)},</p>
      <p>Thank you for your order! We have received your purchase and will process it shortly.</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Order Date:</strong> ${new Date(orderDate).toLocaleDateString()}</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
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
            <td style="padding: 8px; text-align: right;"><strong>₹${total}</strong></td>
          </tr>
        </tfoot>
      </table>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p>We will send you a shipping notification soon.</p>
      <p>Best regards,<br>Karthikeyan Analysis Team</p>
    </div>
  `;

  await safeSendMail({
    to: customerEmail,
    subject: `Order Confirmation - ${orderId}`,
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
      <p style="text-align:right;"><strong>Total:</strong> ₹${escapeHtml(total)}</p>
    </div>
  `;

  await safeSendMail({
    to: getAdminEmail(),
    subject: `New Order: ${orderId}`,
    html,
    replyTo: customerEmail,
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
      await Promise.all([
        sendOrderConfirmation({
          orderId,
          customerName,
          customerEmail,
          items: normalizedItems,
          total,
          orderDate: new Date(),
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
