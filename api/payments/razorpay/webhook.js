import crypto from "crypto";
import { getAdminDb } from "../../../server/firebaseAdmin.js";
import { safeSendMail, getAdminEmail, escapeHtml, formatMultiline } from "../../../server/mailer.js";

function normalizeWebhookItems(cartJson) {
  if (!cartJson) return [];
  try {
    const parsed = JSON.parse(cartJson);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((c) => ({
        name: String(c.n || c.name || "").trim(),
        quantity: Number(c.q || c.quantity || 1),
        price: Number(c.p || c.price || 0),
      }))
      .filter((i) => i.name.length > 0);
  } catch (_) {
    return [];
  }
}

export default async function handler(req, res) {
  // Razorpay sends POST; OPTIONS for preflight
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Verify Razorpay webhook signature when secret is configured
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (webhookSecret) {
    const signature = req.headers["x-razorpay-signature"];
    const bodyStr = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    const expected = crypto.createHmac("sha256", webhookSecret).update(bodyStr).digest("hex");
    if (signature !== expected) {
      console.error("Webhook: invalid signature");
      return res.status(400).json({ error: "Invalid webhook signature" });
    }
  } else {
    // No secret configured — log a warning but continue (useful during initial setup)
    console.warn("Webhook: RAZORPAY_WEBHOOK_SECRET not set; skipping signature check");
  }

  try {
    const event = req.body;
    const eventName = event?.event;

    // Only act on payment.captured — everything else is acknowledged and ignored
    if (eventName !== "payment.captured") {
      return res.status(200).json({ received: true, note: "event not handled" });
    }

    const payment = event?.payload?.payment?.entity;
    if (!payment?.id || !payment?.order_id) {
      console.error("Webhook: payment.captured missing payment entity fields");
      return res.status(200).json({ received: true, note: "incomplete payload" });
    }

    const orderId = `rp_${payment.order_id}`;
    const db = getAdminDb();
    const ref = db.collection("orders").doc(orderId);
    const existing = await ref.get();

    if (existing.exists) {
      // Already created by the verify endpoint — idempotent, nothing to do
      return res.status(200).json({ received: true, note: "order already exists" });
    }

    // Order missing from Firestore — the frontend verify call was lost.
    // Reconstruct from the notes we embed when creating the Razorpay order.
    const notes = payment.notes || {};
    const customerName = notes.customerName || "";
    const customerEmail = notes.customerEmail || "";
    const customerPhone = notes.customerPhone || "";
    const address = notes.address || "";
    const items = normalizeWebhookItems(notes.cartJson);
    const total = Number(payment.amount || 0) / 100;

    const record = {
      id: orderId,
      provider: "razorpay",
      razorpay_order_id: payment.order_id,
      razorpay_payment_id: payment.id,
      customerName,
      customerEmail,
      customerPhone,
      items,
      total,
      address,
      status: "paid",
      // Flag so admin knows this was recovered via webhook, not the normal flow
      recoveredViaWebhook: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(notes.userId ? { userId: String(notes.userId) } : {}),
      ...(notes.userEmail ? { userId_email: String(notes.userEmail).toLowerCase() } : {}),
    };

    await ref.set(record);
    console.log("Webhook: recovered order", orderId, "payment", payment.id);

    // Alert admin so they know a webhook recovery happened
    const itemsHtml = items.length
      ? items.map((i) => `<li>${escapeHtml(i.name)} × ${i.quantity} @ ₹${i.price}</li>`).join("")
      : "<li><em>Item details not available — check Razorpay dashboard</em></li>";

    try {
      await safeSendMail({
        to: getAdminEmail(),
        subject: `[ACTION NEEDED] Webhook-recovered order: ${orderId}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#b45309;">Order recovered via Razorpay webhook</h2>
            <p>
              This order was <strong>not captured by the normal checkout flow</strong> — most likely
              because the customer's browser closed or lost internet after payment, before the
              confirmation could be sent to our server. Razorpay's webhook has recovered it.
            </p>
            <p><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>
            <p><strong>Payment ID:</strong> ${escapeHtml(payment.id)}</p>
            <p><strong>Customer:</strong> ${escapeHtml(customerName)} — ${escapeHtml(customerEmail)} — ${escapeHtml(customerPhone)}</p>
            <p><strong>Total:</strong> ₹${escapeHtml(String(total))}</p>
            ${address ? `<p><strong>Address:</strong><br>${formatMultiline(address)}</p>` : ""}
            <p><strong>Items:</strong></p>
            <ul>${itemsHtml}</ul>
            <hr style="border:none;border-top:1px solid #ddd;margin:16px 0;" />
            <p>
              The order is now visible in the admin panel with status <strong>Paid</strong>.
              Please send the customer a manual confirmation email if they have not received one.
            </p>
          </div>
        `,
        replyTo: customerEmail || getAdminEmail(),
      });
    } catch (emailErr) {
      console.error("Webhook: admin alert email failed:", emailErr?.message);
    }

    return res.status(200).json({ received: true, orderId });
  } catch (err) {
    console.error("Webhook handler error:", err);
    // Always return 200 to Razorpay — a 5xx causes it to retry indefinitely
    return res.status(200).json({ received: true, error: "internal error logged" });
  }
}
