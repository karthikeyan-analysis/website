import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";

export const userService = {
  // ── Profile ──────────────────────────────────────────────────────────────

  async getOrCreateProfile(firebaseUser) {
    const ref = doc(db, "customers", firebaseUser.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) return { uid: snap.id, ...snap.data() };
    const profile = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || "",
      email: (firebaseUser.email || "").toLowerCase(),
      phone: "",
      photoURL: firebaseUser.photoURL || "",
      provider: firebaseUser.providerData?.[0]?.providerId || "password",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(ref, profile);
    return profile;
  },

  async getProfile(uid) {
    const ref = doc(db, "customers", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { uid: snap.id, ...snap.data() };
  },

  async updateProfile(uid, data) {
    const ref = doc(db, "customers", uid);
    const update = { ...data, updatedAt: new Date().toISOString() };
    await updateDoc(ref, update);
    const snap = await getDoc(ref);
    return { uid: snap.id, ...snap.data() };
  },

  async getAllCustomers() {
    try {
      const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
    } catch {
      return [];
    }
  },

  // ── Addresses ─────────────────────────────────────────────────────────────

  async getAddresses(uid) {
    try {
      const q = query(
        collection(db, "customers", uid, "addresses"),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch {
      return [];
    }
  },

  async addAddress(uid, address) {
    const now = new Date().toISOString();
    const ref = collection(db, "customers", uid, "addresses");
    const docRef = await addDoc(ref, { ...address, createdAt: now, updatedAt: now });
    return { id: docRef.id, ...address, createdAt: now, updatedAt: now };
  },

  async updateAddress(uid, addressId, data) {
    const ref = doc(db, "customers", uid, "addresses", addressId);
    const update = { ...data, updatedAt: new Date().toISOString() };
    await updateDoc(ref, update);
    return { id: addressId, ...update };
  },

  async deleteAddress(uid, addressId) {
    await deleteDoc(doc(db, "customers", uid, "addresses", addressId));
  },

  async setDefaultAddress(uid, addressId) {
    const addresses = await userService.getAddresses(uid);
    await Promise.all(
      addresses.map((addr) =>
        updateDoc(doc(db, "customers", uid, "addresses", addr.id), {
          isDefault: addr.id === addressId,
        }),
      ),
    );
  },

  // ── Wishlist ──────────────────────────────────────────────────────────────

  async getWishlist(uid) {
    try {
      const q = query(
        collection(db, "customers", uid, "wishlist"),
        orderBy("addedAt", "desc"),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ docId: d.id, ...d.data() }));
    } catch {
      return [];
    }
  },

  async addToWishlist(uid, product) {
    const ref = doc(db, "customers", uid, "wishlist", String(product.id));
    await setDoc(ref, {
      id: product.id,
      name: product.name || "",
      price: product.price || 0,
      mrpPrice: product.mrpPrice || product.price || 0,
      image: product.image || "",
      category: product.category || "",
      stockStatus: product.stockStatus || "",
      addedAt: new Date().toISOString(),
    });
  },

  async removeFromWishlist(uid, productId) {
    await deleteDoc(doc(db, "customers", uid, "wishlist", String(productId)));
  },

  // ── Cart persistence ───────────────────────────────────────────────────────

  async saveCart(uid, items) {
    const ref = doc(db, "customers", uid, "cart", "current");
    await setDoc(ref, { items, updatedAt: new Date().toISOString() });
  },

  async getCart(uid) {
    try {
      const ref = doc(db, "customers", uid, "cart", "current");
      const snap = await getDoc(ref);
      if (!snap.exists()) return [];
      return snap.data().items || [];
    } catch {
      return [];
    }
  },

  async clearCart(uid) {
    const ref = doc(db, "customers", uid, "cart", "current");
    await setDoc(ref, { items: [], updatedAt: new Date().toISOString() });
  },

  // ── Orders by user email ───────────────────────────────────────────────────

  async getOrdersByEmail(email) {
    try {
      const q = query(
        collection(db, "orders"),
        where("customerEmail", "==", String(email).toLowerCase()),
      );
      const snap = await getDocs(q);
      const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return orders.sort((a, b) => {
        const ta = new Date(a.createdAt || 0).getTime();
        const tb = new Date(b.createdAt || 0).getTime();
        return tb - ta;
      });
    } catch {
      return [];
    }
  },
};
