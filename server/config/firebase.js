import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Missing env var: ${name}. Create server/.env (or set it in your shell) before starting the API server.`,
    );
  }
  return v;
}

const serviceAccount = {
  type: "service_account",
  project_id: requireEnv("FIREBASE_PROJECT_ID"),
  private_key_id: "key-id",
  private_key: requireEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
  client_email: requireEnv("FIREBASE_CLIENT_EMAIL"),
  client_id: "client-id",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;
