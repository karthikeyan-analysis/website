import crypto from "crypto";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Accept, Content-Type, Date, X-Api-Version",
  );

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return res.status(500).json({ error: "Razorpay is not configured" });
    }

    const { amount, currency = "INR", receipt } = req.body || {};
    const rupees = Number(amount);
    if (!Number.isFinite(rupees) || rupees <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const amountPaise = Math.round(rupees * 100);
    const finalReceipt =
      typeof receipt === "string" && receipt.trim()
        ? receipt.trim()
        : `rcpt_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    const basic = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency,
        receipt: finalReceipt,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.description || "Failed to create Razorpay order",
      });
    }

    res.status(201).json({
      keyId,
      order: data,
    });
  } catch (error) {
    console.error("Razorpay order error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

