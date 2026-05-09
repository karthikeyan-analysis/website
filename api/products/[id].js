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
    const { id } = req.query;
    if (!id) {
      res.status(400).json({ error: "Missing product id" });
      return;
    }

    const db = getAdminDb();
    const ref = db.collection("products").doc(String(id));

    if (req.method === "GET") {
      const snap = await ref.get();
      if (!snap.exists) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      res.status(200).json({ id: snap.id, ...snap.data() });
      return;
    }

    if (req.method === "PUT") {
      const body = req.body || {};
      const update = {
        ...body,
        updatedAt: new Date(),
      };
      await ref.set(update, { merge: true });
      const snap = await ref.get();
      res.status(200).json({ id: snap.id, ...snap.data() });
      return;
    }

    if (req.method === "DELETE") {
      await ref.delete();
      res.status(200).json({ success: true, message: "Product deleted" });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Product API error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

