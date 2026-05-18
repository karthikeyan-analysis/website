import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";

const ADMINS_COLLECTION = "admins";

export function getSignupSecretRequired() {
  return Boolean(import.meta.env.VITE_ADMIN_SIGNUP_SECRET?.trim());
}

export function validatePassword(password) {
  if (!password || password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must include a lowercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must include a number.";
  }
  return null;
}

export function mapFirebaseAuthError(error) {
  const code = error?.code || "";
  const messages = {
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "Invalid email or password.",
    "auth/wrong-password": "Invalid email or password.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password is too weak. Use at least 8 characters with a lowercase letter and a number.",
    "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
    "auth/operation-not-allowed": "Email/password sign-in is not enabled. Contact support.",
  };
  return messages[code] || "Authentication failed. Please try again.";
}

export async function fetchAdminProfile(uid) {
  const snap = await getDoc(doc(db, ADMINS_COLLECTION, uid));
  if (!snap.exists()) return null;
  return { id: uid, ...snap.data() };
}

export async function createAdminProfile(user, name) {
  await setDoc(doc(db, ADMINS_COLLECTION, user.uid), {
    email: user.email,
    name: name?.trim() || user.displayName || "Admin",
    role: "admin",
    createdAt: serverTimestamp(),
  });
}

function adminFromUser(user, profile) {
  return {
    id: user.uid,
    email: user.email,
    name: profile?.name || user.displayName || "Admin",
    role: profile?.role || "admin",
  };
}

export async function loginAdmin(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const credential = await signInWithEmailAndPassword(
    auth,
    normalizedEmail,
    password,
  );
  const profile = await fetchAdminProfile(credential.user.uid);
  if (!profile) {
    await signOut(auth);
    return {
      success: false,
      error: "This account is not authorized for admin access.",
    };
  }
  return { success: true, admin: adminFromUser(credential.user, profile) };
}

export async function signupAdmin({ name, email, password, signupSecret }) {
  const requiredSecret = import.meta.env.VITE_ADMIN_SIGNUP_SECRET?.trim();
  if (requiredSecret && signupSecret?.trim() !== requiredSecret) {
    return {
      success: false,
      error: "Invalid authorization code.",
    };
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return { success: false, error: passwordError };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const credential = await createUserWithEmailAndPassword(
    auth,
    normalizedEmail,
    password,
  );

  const displayName = name.trim();
  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }

  await createAdminProfile(credential.user, displayName);
  const profile = await fetchAdminProfile(credential.user.uid);

  return {
    success: true,
    admin: adminFromUser(credential.user, profile),
  };
}

export async function logoutAdmin() {
  await signOut(auth);
}

export async function resolveAdminSession(user) {
  if (!user) return null;
  const profile = await fetchAdminProfile(user.uid);
  if (!profile) return null;
  return adminFromUser(user, profile);
}
