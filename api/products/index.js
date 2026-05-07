import dotenv from "dotenv";
import { getAdminDb } from "../_lib/firebaseAdmin.js";

dotenv.config();

function cors(req, res) {
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
    return true;
  }
  return false;
}

export default async function handler(req, res) {
  if (cors(req, res)) return;

  try {
    const db = getAdminDb();
    const col = db.collection("products");

    if (req.method === "GET") {
      const snap = await col.orderBy("createdAt", "desc").get();
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      res.status(200).json(items);
      return;
    }

    if (req.method === "POST") {
      const {
        name,
        price,
        categoryId,
        category,
        description,
        image,
        stock,
      } = req.body || {};

      if (!name || !String(name).trim()) {
        res.status(400).json({ error: "Product name is required" });
        return;
      }
      const p = Number(price);
      if (!Number.isFinite(p) || p <= 0) {
        res.status(400).json({ error: "Valid price is required" });
        return;
      }
      if (!categoryId) {
        res.status(400).json({ error: "Category is required" });
        return;
      }
      const s = Number(stock);
      if (!Number.isFinite(s) || s < 0) {
        res.status(400).json({ error: "Valid stock quantity is required" });
        return;
      }
      if (!description || !String(description).trim()) {
        res.status(400).json({ error: "Description is required" });
        return;
      }

      const now = new Date();
      const data = {
        name: String(name).trim(),
        price: p,
        categoryId: String(categoryId),
        category: category ? String(category).trim() : "",
        description: String(description).trim(),
        image: image ? String(image).trim() : "",
        stock: Math.trunc(s),
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await col.add(data);
      res.status(201).json({ id: docRef.id, ...data });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Products API error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

