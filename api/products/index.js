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
        mrpPrice,
        price,
        categoryId,
        category,
        description,
        image,
        images,
        stock,
        stockStatus,
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
      const mrpRaw = mrpPrice === null || mrpPrice === undefined || mrpPrice === "" ? null : Number(mrpPrice);
      if (mrpRaw !== null) {
        if (!Number.isFinite(mrpRaw) || mrpRaw <= 0) {
          res.status(400).json({ error: "Valid MRP price is required" });
          return;
        }
        if (mrpRaw < p) {
          res.status(400).json({ error: "MRP must be >= selling price" });
          return;
        }
      }
      if (!categoryId) {
        res.status(400).json({ error: "Category is required" });
        return;
      }
      const normalizedStockStatus = normalizeStockStatus(stockStatus, stock);
      if (!description || !String(description).trim()) {
        res.status(400).json({ error: "Description is required" });
        return;
      }

      const now = new Date();
      const normalizedImages = Array.isArray(images)
        ? images.map((url) => String(url || "").trim()).filter(Boolean)
        : [];
      const primaryImage = normalizedImages[0] || (image ? String(image).trim() : "");
      const data = {
        name: String(name).trim(),
        mrpPrice: mrpRaw,
        price: p,
        categoryId: String(categoryId),
        category: category ? String(category).trim() : "",
        description: String(description).trim(),
        image: primaryImage,
        images: primaryImage ? [primaryImage, ...normalizedImages.filter((url) => url !== primaryImage)] : normalizedImages,
        stockStatus: normalizedStockStatus,
        stock: normalizedStockStatus === STOCK_STATUS.IN_STOCK ? 1 : 0,
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

