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

/**
 * Safely get the raw request body as a string for HMAC verification.
 * Vercel pre-parses JSON bodies, so req.body is already an object.
 * We must re-serialize deterministically — but Razorpay signs the ORIGINAL raw bytes.
 *
 * Strategy: Vercel sets the raw body on req.rawBody when you configure
 * `bodyParser: false` in the Vercel function config. We check for that first.
 * If not available, we re-serialize the object. The HMAC will only match if the
 * JSON is identical to what Razorpay sent, which it usually is for simple objects.
 */
function getRawBodyString(req) {
  // Vercel sometimes exposes the raw body buffer
  if (req.rawBody) {
    return typeof req.rawBody === "string"
      ? req.rawBody
      : req.rawBody.toString("utf8");
  }
  // Fallback: re-serialize the parsed body
  if (typeof req.body === "string") return req.body;
  if (req.body && typeof req.body === "object") return JSON.stringify(req.body);
  return "";
}

async function findOrCreateOrder(db, orderId, paymentId, record) {
  const ref = db.collection("orders").doc(orderId);
  const existing = await ref.get();
  if (existing.exists) {
    return { exists: true, orderId };
  }

  // Secondary idempotency check: did a previous webhook with different order_id already save this payment?
  try {
    const dupSnap = await db
      .collection("orders")
      .where("razorpay_payment_id", "==", paymentId)
      .limit(1)
      .get();
    if (!dupSnap.empty) {
      return { exists: true, orderId: dupSnap.docs[0].id };
    }
  } catch (e) {
    console.warn("Webhook: secondary idempotency check failed (non-fatal):", e?.message);
  }

  await ref.set(record);
  return { exists: false, orderId };
}

export default async function handler(req, res) {
  // Razorpay sends POST; OPTIONS for preflight
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // ── Signature verification ──────────────────────────────────────────────
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (webhookSecret) {
    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      console.error("Webhook: x-razorpay-signature header missing");
      return res.status(400).json({ error: "Missing webhook signature header" });
    }
    const bodyStr = getRawBodyString(req);
    const expected = crypto.createHmac("sha256", webhookSecret).update(bodyStr).digest("hex");
    if (signature !== expected) {
      console.error(
        "Webhook: invalid signature. If you just set RAZORPAY_WEBHOOK_SECRET on Vercel, " +
          "make sure the secret matches exactly what is configured in the Razorpay dashboard.",
      );
      // Return 200 to Razorpay to prevent infinite retries while we investigate;
      // log the failure so we can diagnose.
      return res.status(200).json({ received: true, note: "signature mismatch — logged" });
    }
  } else {
    // No secret configured — warn but continue
    console.warn(
      "Webhook: RAZORPAY_WEBHOOK_SECRET not set. " +
        "Set it in Vercel env vars to match your Razorpay dashboard webhook secret.",
    );
  }

  try {
    const event = req.body;
    const eventName = event?.event;

    // ── Handle: payment.captured ────────────────────────────────────────────
    // Fired for card payments, wallets, and some netbanking flows.
    if (eventName === "payment.captured") {
      const payment = event?.payload?.payment?.entity;
      if (!payment?.id || !payment?.order_id) {
        console.error("Webhook payment.captured: missing payment entity fields");
        return res.status(200).json({ received: true, note: "incomplete payload" });
      }
      await handlePayment({ payment, db: getAdminDb(), eventName });
      return res.status(200).json({ received: true, event: eventName });
    }

    // ── Handle: order.paid ──────────────────────────────────────────────────
    // Fired for UPI, many Netbanking flows, and when the order transitions to paid.
    // This is CRITICAL for UPI payments which are very common in India.
    if (eventName === "order.paid") {
      const payment = event?.payload?.payment?.entity;
      const order = event?.payload?.order?.entity;

      // Use the payment entity if available; fallback to order entity for IDs
      const paymentEntity = payment || {};
      if (!paymentEntity.id && !paymentEntity.order_id) {
        // If payment entity is incomplete, try to reconstruct from order entity
        if (order?.id) {
          paymentEntity.order_id = order.id;
          paymentEntity.amount = order.amount_paid || order.amount;
          paymentEntity.notes = order.notes || {};
        }
      }

      // Ensure we have a payment id (order.paid always includes payment entity)
      if (!paymentEntity.id || !paymentEntity.order_id) {
        console.error("Webhook order.paid: missing payment or order entity fields", JSON.stringify(event?.payload));
        return res.status(200).json({ received: true, note: "incomplete payload — no payment id" });
      }

      await handlePayment({ payment: paymentEntity, db: getAdminDb(), eventName });
      return res.status(200).json({ received: true, event: eventName });
    }

    // All other events — acknowledge and ignore
    return res.status(200).json({ received: true, note: `event '${eventName}' not handled` });
  } catch (err) {
    console.error("Webhook handler error:", err);
    // Always return 200 to Razorpay — a 5xx causes it to retry indefinitely
    return res.status(200).json({ received: true, error: "internal error logged" });
  }
}

/**
 * Core logic: given a Razorpay payment entity, create the order in Firestore
 * if it doesn't already exist.
 */
async function handlePayment({ payment, db, eventName }) {
  const orderId = `rp_${payment.order_id}`;

  const notes = payment.notes || {};
  const customerName = notes.customerName || "";
  const customerEmail = notes.customerEmail || "";
  const customerPhone = notes.customerPhone || "";
  const address = notes.address || "";
  const items = normalizeWebhookItems(notes.cartJson);
  const total = Number(payment.amount || 0) / 100;

  // Flag as needing review if customer info is missing from notes
  const needsReview = !customerName || !customerEmail || !customerPhone;

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
    webhookEvent: eventName,
    ...(needsReview ? { needsReview: true } : {}),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...(notes.userId ? { userId: String(notes.userId) } : {}),
    ...(notes.userEmail ? { userId_email: String(notes.userEmail).toLowerCase() } : {}),
  };

  const result = await findOrCreateOrder(db, orderId, payment.id, record);

  if (result.exists) {
    // Already created by the verify endpoint or a prior webhook — nothing to do
    console.log("Webhook: order already exists:", result.orderId, "event:", eventName);
    return;
  }

  console.log("Webhook: recovered order", orderId, "payment", payment.id, "via", eventName);

  // Alert admin about webhook recovery
  const itemsHtml = items.length
    ? items.map((i) => `<li>${escapeHtml(i.name)} × ${i.quantity} @ ₹${i.price}</li>`).join("")
    : "<li><em>Item details not available — check Razorpay dashboard notes</em></li>";

  const reviewBanner = needsReview
    ? `<div style="background:#fef3c7;border:1px solid #d97706;border-radius:6px;padding:12px;margin-bottom:16px;">
        <strong style="color:#92400e;">⚠️ Customer details missing from order notes</strong><br>
        <span style="color:#78350f;font-size:13px;">Please contact the customer via Razorpay dashboard using Payment ID: <code>${escapeHtml(payment.id)}</code></span>
      </div>`
    : "";

  try {
    await safeSendMail({
      to: getAdminEmail(),
      subject: needsReview
        ? `[ACTION NEEDED] Webhook-recovered order (incomplete data): ${orderId}`
        : `[ACTION NEEDED] Webhook-recovered order: ${orderId}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          ${reviewBanner}
          <h2 style="color:#b45309;">Order recovered via Razorpay webhook (${escapeHtml(eventName)})</h2>
          <p>
            This order was <strong>not captured by the normal checkout flow</strong> — most likely
            because the customer's browser closed or lost internet after payment. Razorpay's webhook has recovered it.
          </p>
          <p><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>
          <p><strong>Payment ID:</strong> ${escapeHtml(payment.id)}</p>
          <p><strong>Customer:</strong> ${escapeHtml(customerName || "(missing)")} — ${escapeHtml(customerEmail || "(missing)")} — ${escapeHtml(customerPhone || "(missing)")}</p>
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
}
