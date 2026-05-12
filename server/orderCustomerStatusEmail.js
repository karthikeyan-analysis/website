import {
  buildOrderStatusSupportCalloutHtml,
  escapeHtml,
  formatMultiline,
} from "./mailer.js";

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

export function getCustomerStatusEmailSubject(status, orderId) {
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
        summary:
          "Your order has been shipped and is on the way to your delivery address.",
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

/**
 * Full customer-facing HTML body for order status updates (shipped, paid, etc.).
 * Used by both POST /orders (sendStatusEmail) and PUT /orders/:id so content stays identical.
 */
export function buildCustomerOrderStatusEmailBodyHtml({
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
}) {
  const statusInfo = getStatusContent(status);
  const headline = getCustomerStatusEmailHeadline(status);
  const placedAt = normalizeDate(orderDate);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10197E;">${escapeHtml(headline)}</h2>
      <p>Dear ${escapeHtml(customerName || "Customer")},</p>

      <div style="margin:18px 0;padding:14px 16px;background:#f5f7ff;border:1px solid #cfd6f6;border-radius:6px;">
        <p style="margin:0 0 6px 0;font-size:13px;color:#334;text-transform:uppercase;letter-spacing:0.04em;">Your order ID</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#10197E;word-break:break-all;">${escapeHtml(orderId)}</p>
        <p style="margin:12px 0 0 0;font-size:14px;color:#333;">
          Always use this Order ID when you contact us or when you check your order status on our website.
        </p>
      </div>

      <p>Your order <strong>${escapeHtml(orderId)}</strong> status is now:</p>
      <p style="font-size: 16px; font-weight: 700; color: #10197E;">${escapeHtml(
        statusInfo.label,
      )}</p>
      <p>${escapeHtml(statusInfo.summary)}</p>

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
        ${buildOrderStatusSupportCalloutHtml(status, supportPhone)}
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
}
