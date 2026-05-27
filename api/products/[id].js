import dotenv from "dotenv";
import { getAdminDb } from "../../server/firebaseAdmin.js";

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

const STOCK_STATUS = {
  IN_STOCK: "in-stock",
  OUT_OF_STOCK: "out-of-stock",
  LAUNCHING_SOON: "launching-soon",
};

function normalizeStockStatus(value, legacyStock) {
  const raw = String(value || "").trim().toLowerCase();
  const compact = raw.replace(/[\s_]+/g, "-");

  if (compact === STOCK_STATUS.IN_STOCK || compact === "instock") {
    return STOCK_STATUS.IN_STOCK;
  }
  if (compact === STOCK_STATUS.OUT_OF_STOCK || compact === "outofstock") {
    return STOCK_STATUS.OUT_OF_STOCK;
  }
  if (compact === STOCK_STATUS.LAUNCHING_SOON || compact === "launchingsoon") {
    return STOCK_STATUS.LAUNCHING_SOON;
  }

  const numericStock = Number(legacyStock);
  if (Number.isFinite(numericStock)) {
    return numericStock > 0 ? STOCK_STATUS.IN_STOCK : STOCK_STATUS.OUT_OF_STOCK;
  }

  return STOCK_STATUS.IN_STOCK;
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
      const normalizedStockStatus =
        "stockStatus" in body || "stock" in body
          ? normalizeStockStatus(body.stockStatus, body.stock)
          : null;
      const update = {
        ...body,
        ...(normalizedStockStatus
          ? {
              stockStatus: normalizedStockStatus,
              stock: normalizedStockStatus === STOCK_STATUS.IN_STOCK ? 1 : 0,
            }
          : {}),
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

