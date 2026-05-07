import express from "express";
import { db } from "../config/firebase.js";

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  try {
    const snap = await db.collection("products").orderBy("createdAt", "desc").get();
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(rows);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get product by id
router.get("/:id", async (req, res) => {
  try {
    const doc = await db.collection("products").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Product not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create product
router.post("/", async (req, res) => {
  try {
    const { name, price, description, categoryId, imageUrl, stock } = req.body || {};

    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ error: "Product name is required" });
    }

    const nPrice = Number(price);
    if (!Number.isFinite(nPrice) || nPrice < 0) {
      return res.status(400).json({ error: "Valid price is required" });
    }

    const docRef = await db.collection("products").add({
      name: String(name).trim(),
      price: nPrice,
      description: description ? String(description) : "",
      categoryId: categoryId ? String(categoryId) : "",
      imageUrl: imageUrl ? String(imageUrl) : "",
      stock: Number.isFinite(Number(stock)) ? Number(stock) : 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({ id: docRef.id });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put("/:id", async (req, res) => {
  try {
    const ref = db.collection("products").doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Product not found" });

    const prev = snap.data();
    const next = {
      ...prev,
      ...req.body,
      updatedAt: new Date(),
    };

    await ref.set(next, { merge: true });
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  try {
    const ref = db.collection("products").doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Product not found" });
    await ref.delete();
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

