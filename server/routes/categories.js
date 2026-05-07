import express from "express";
import { db } from "../config/firebase.js";

const router = express.Router();

// Get all categories
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("categories").orderBy("name").get();
    const categories = [];
    snapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get category by ID
router.get("/:id", async (req, res) => {
  try {
    const doc = await db.collection("categories").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: error.message });
  }
});

// Add new category
router.post("/", async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    // Check if category already exists
    const existing = await db
      .collection("categories")
      .where("name", "==", name.trim())
      .get();

    if (!existing.empty) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const docRef = await db.collection("categories").add({
      name: name.trim(),
      description: description || "",
      image: image || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      id: docRef.id,
      name: name.trim(),
      description: description || "",
      image: image || "",
    });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update category
router.put("/:id", async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const categoryRef = db.collection("categories").doc(req.params.id);

    const doc = await categoryRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Category not found" });
    }

    await categoryRef.update({
      name: name || doc.data().name,
      description:
        description !== undefined ? description : doc.data().description,
      image: image || doc.data().image,
      updatedAt: new Date(),
    });

    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete category
router.delete("/:id", async (req, res) => {
  try {
    // Check if category has products
    const products = await db
      .collection("products")
      .where("categoryId", "==", req.params.id)
      .get();

    if (!products.empty) {
      return res.status(400).json({
        error:
          "Cannot delete category with existing products. Move products to another category first.",
      });
    }

    await db.collection("categories").doc(req.params.id).delete();
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
