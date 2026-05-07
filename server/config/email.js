import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: htmlContent,
      replyTo: process.env.EMAIL_FROM,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const sendContactConfirmation = async (contactData) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10197E;">Thank You for Contacting Us</h2>
      <p>Dear ${contactData.name},</p>
      <p>We have received your message and will get back to you shortly.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <h3>Your Message Details:</h3>
      <p><strong>Email:</strong> ${contactData.email}</p>
      <p><strong>Phone:</strong> ${contactData.phone}</p>
      <p><strong>Subject:</strong> ${contactData.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${contactData.message.replace(/\n/g, "<br>")}</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p>Best regards,<br><strong>Karthikeyan Analysis Study Circle</strong></p>
    </div>
  `;

  return sendEmail(contactData.email, "We received your message", htmlContent);
};

export const sendOrderConfirmation = async (orderData) => {
  const itemsHtml = orderData.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price.toFixed(2)}</td>
    </tr>
  `,
    )
    .join("");

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10197E;">Order Confirmation</h2>
      <p>Dear ${orderData.customerName},</p>
      <p>Thank you for your order! We're excited to send your items.</p>
      
      <h3 style="margin-top: 20px;">Order Details</h3>
      <p><strong>Order ID:</strong> #${orderData.orderId}</p>
      <p><strong>Order Date:</strong> ${new Date(orderData.orderDate).toLocaleDateString()}</p>
      
      <h3 style="margin-top: 20px;">Items Ordered</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <h3 style="margin-top: 20px; text-align: right;">Total: ₹${orderData.total.toFixed(2)}</h3>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p>We'll notify you when your order ships. You can track it anytime on our website.</p>
      <p>Best regards,<br><strong>Karthikeyan Analysis Study Circle</strong></p>
    </div>
  `;

  return sendEmail(
    orderData.customerEmail,
    "Order Confirmation #" + orderData.orderId,
    htmlContent,
  );
};

export const sendOrderShipped = async (orderData) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #662082;">Your Order Has Shipped!</h2>
      <p>Dear ${orderData.customerName},</p>
      <p>Great news! Your order #${orderData.orderId} has been shipped.</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Tracking Number:</strong> ${orderData.trackingNumber || "Will be updated soon"}</p>
        <p><strong>Expected Delivery:</strong> ${orderData.expectedDelivery || "3-5 business days"}</p>
      </div>
      
      <p>You can track your shipment on our website or using the tracking number above.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p>Thank you for your order!<br><strong>Karthikeyan Analysis Study Circle</strong></p>
    </div>
  `;

  return sendEmail(
    orderData.customerEmail,
    "Your Order #" + orderData.orderId + " Has Shipped",
    htmlContent,
  );
};

export const sendOrderDelivered = async (orderData) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10197E;">Your Order Has Been Delivered!</h2>
      <p>Dear ${orderData.customerName},</p>
      <p>Your order #${orderData.orderId} has been delivered successfully!</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Delivered on:</strong> ${new Date(orderData.deliveredDate).toLocaleDateString()}</p>
        <p><strong>Delivery Address:</strong> ${orderData.deliveryAddress || ""}</p>
      </div>
      
      <p>We hope you're satisfied with your purchase. If you have any questions or concerns, please don't hesitate to contact us.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p>Thank you for shopping with us!<br><strong>Karthikeyan Analysis Study Circle</strong></p>
    </div>
  `;

  return sendEmail(
    orderData.customerEmail,
    "Order #" + orderData.orderId + " Delivered",
    htmlContent,
  );
};

export default transporter;
