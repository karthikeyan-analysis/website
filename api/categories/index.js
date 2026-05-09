import { getAdminDb } from "../../server/firebaseAdmin.js";

function categoriesCollection() {
  const db = getAdminDb();
  return db.collection("categories");
}

export default async function handler(req, res) {
  // Enable CORS
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
    return;
  }

  try {
    if (req.method === "GET") {
      const snap = await categoriesCollection().orderBy("name", "asc").get();
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      res.status(200).json(rows);
    } else if (req.method === "POST") {
      const { _action, id, name, description, image } = req.body;

      if (_action === "delete") {
        if (!id || typeof id !== "string") {
          return res.status(400).json({ error: "Invalid category id" });
        }

        const ref = categoriesCollection().doc(id);
        const snap = await ref.get();
        if (!snap.exists) {
          return res.status(404).json({ error: "Category not found" });
        }

        await ref.delete();
        return res
          .status(200)
          .json({ success: true, message: "Category deleted successfully" });
      }

      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Category name is required" });
      }

      const docRef = await categoriesCollection().add({
        name: name.trim(),
        description: description || "",
        image: image || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      res.status(201).json({
        id: docRef.id,
        name: name.trim(),
        description: description || "",
        image: image || "",
        message: "Category added successfully",
      });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
