import { getAdminDb } from "../_lib/firebaseAdmin";

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
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid category id" });
    }

    if (req.method === "GET") {
      const snap = await categoriesCollection().doc(id).get();
      if (!snap.exists) return res.status(404).json({ error: "Category not found" });
      res.status(200).json({ id: snap.id, ...snap.data() });
    } else if (req.method === "PUT") {
      const { name, description, image } = req.body;

      const ref = categoriesCollection().doc(id);
      const snap = await ref.get();
      if (!snap.exists) return res.status(404).json({ error: "Category not found" });
      const prev = snap.data();

      await ref.set(
        {
          ...prev,
          name: name && name.trim() ? name.trim() : prev.name,
          description: description !== undefined ? description : prev.description,
          image: image !== undefined ? image : prev.image,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      res
        .status(200)
        .json({ success: true, message: "Category updated successfully" });
    } else if (req.method === "DELETE") {
      const ref = categoriesCollection().doc(id);
      const snap = await ref.get();
      if (!snap.exists) return res.status(404).json({ error: "Category not found" });
      await ref.delete();
      res
        .status(200)
        .json({ success: true, message: "Category deleted successfully" });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
