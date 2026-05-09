import dotenv from "dotenv";
import { getAdminDb } from "./_lib/firebaseAdmin.js";

dotenv.config();

function cors(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,POST",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }
  return false;
}

export default async function handler(req, res) {
  if (cors(req, res)) return;

  try {
    const db = getAdminDb();
    const col = db.collection("productReviews");

    if (req.method === "GET") {
      const productId = String(req.query?.productId || "").trim();
      if (!productId) {
        return res.status(400).json({ error: "productId is required" });
      }

      const snap = await col
        .where("productId", "==", productId)
        .orderBy("createdAt", "desc")
        .get();
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const { productId, productName, name, email, rating, review } = req.body || {};
      const cleanProductId = String(productId || "").trim();
      const cleanName = String(name || "").trim();
      const cleanEmail = String(email || "").trim().toLowerCase();
      const cleanReview = String(review || "").trim();
      const numericRating = Number(rating);

      if (!cleanProductId) {
        return res.status(400).json({ error: "productId is required" });
      }
      if (!cleanName) {
        return res.status(400).json({ error: "Name is required" });
      }
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json({ error: "Valid email is required" });
      }
      if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }
      if (!cleanReview) {
        return res.status(400).json({ error: "Review is required" });
      }

      const now = new Date();
      const data = {
        productId: cleanProductId,
        productName: String(productName || "").trim(),
        name: cleanName,
        email: cleanEmail,
        rating: numericRating,
        review: cleanReview,
        createdAt: now,
      };

      const docRef = await col.add(data);
      return res.status(201).json({ id: docRef.id, ...data });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Product reviews API error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
