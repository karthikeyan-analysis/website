import { getAdminDb } from "../../server/firebaseAdmin.js";

function contactsCollection() {
  const db = getAdminDb();
  return db.collection("contacts");
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
    const id = req.query?.id;
    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Missing contact id" });
      return;
    }

    if (req.method === "PATCH") {
      // Mark as read (matches frontend calling /contacts/:id/read but we also support /contacts/:id)
      await contactsCollection().doc(id).update({
        read: true,
        readAt: new Date().toISOString(),
      });
      res.status(200).json({ success: true, id });
      return;
    }

    if (req.method === "DELETE") {
      await contactsCollection().doc(id).delete();
      res.status(200).json({ success: true, id });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

