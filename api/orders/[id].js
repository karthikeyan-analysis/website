import { escapeHtml, getAdminEmail, safeSendMail } from "../_lib/mailer";
import { getAdminDb } from "../_lib/firebaseAdmin";

async function sendOrderStatusEmail(
  status,
  { orderId, customerName, customerEmail },
) {
  const statusMessages = {
    shipped: {
      subject: `Your Order Has Been Shipped - ${orderId}`,
      message: "Your order has been shipped and is on its way to you!",
    },
    delivered: {
      subject: `Your Order Has Been Delivered - ${orderId}`,
      message: "Your order has been delivered. Thank you for your purchase!",
    },
    cancelled: {
      subject: `Your Order Has Been Cancelled - ${orderId}`,
      message:
        "Your order has been cancelled. If you have any questions, please contact us.",
    },
  };

  const config = statusMessages[status] || statusMessages.shipped;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10197E;">Order Status Update</h2>
      <p>Dear ${escapeHtml(customerName)},</p>
      <p>${escapeHtml(config.message)}</p>
      <p><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
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
      if (["shipped", "delivered", "cancelled"].includes(status)) {
        await sendOrderStatusEmail(status, {
          orderId: id,
          customerName: prev.customerName,
          customerEmail: prev.customerEmail,
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
