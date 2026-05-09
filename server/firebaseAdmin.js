import admin from "firebase-admin";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function normalizePrivateKey(value) {
  return String(value)
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

function decodeBase64(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  try {
    return Buffer.from(raw, "base64").toString("utf8");
  } catch {
    return "";
  }
}

function getPrivateKeyFromEnv() {
  const b64 = process.env.FIREBASE_PRIVATE_KEY_BASE64;
  if (b64) {
    const decoded = decodeBase64(b64);
    if (decoded) return normalizePrivateKey(decoded);
    throw new Error(
      "Invalid FIREBASE_PRIVATE_KEY_BASE64. Expected base64 of the full PEM text.",
    );
  }

  return normalizePrivateKey(requireEnv("FIREBASE_PRIVATE_KEY"));
}

export function getAdminApp() {
  if (admin.apps.length) return admin.app();

  const projectId = requireEnv("FIREBASE_PROJECT_ID");
  const clientEmail = requireEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = getPrivateKeyFromEnv();

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (error) {
    if (String(error?.message || "").includes("Invalid PEM formatted message")) {
      throw new Error(
        "Invalid Firebase private key. Prefer setting FIREBASE_PRIVATE_KEY_BASE64 to avoid newline issues on Vercel, or paste the full key including BEGIN/END lines and preserve \\n line breaks in FIREBASE_PRIVATE_KEY.",
      );
    }
    throw error;
  }

  return admin.app();
}

export function getAdminDb() {
  getAdminApp();
  return admin.firestore();
}
