import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../config/firebase";
import { contactsAPI, paymentsAPI } from "./api";

// Products Service
export const productsService = {
  async uploadProductImage(file) {
    try {
      if (!file) return "";
      const timestamp = Date.now();
      const safeName = String(file.name || "product")
        .replace(/[^\w.\-]+/g, "_")
        .slice(0, 120);
      const fileName = `${timestamp}_${safeName}`;
      const storageRef = ref(storage, `products/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error("Error uploading product image:", error);
      throw error;
    }
  },

  async addProduct(productData) {
    try {
      const now = new Date();
      const payload = {
        ...productData,
        createdAt: now,
        updatedAt: now,
      };
      const docRef = await addDoc(collection(db, "products"), payload);
      return { id: docRef.id, ...payload };
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  },

  async getProducts() {
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  async getProductById(productId) {
    try {
      const ref = doc(db, "products", String(productId));
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() };
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  async getProductReviews(productId) {
    try {
      const q = query(
        collection(db, "productReviews"),
        where("productId", "==", String(productId)),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    } catch (error) {
      console.error("Error fetching product reviews:", error);
      throw error;
    }
  },

  async addProductReview(payload) {
    try {
      const data = {
        productId: String(payload?.productId || "").trim(),
        productName: String(payload?.productName || "").trim(),
        name: String(payload?.name || "").trim(),
        email: String(payload?.email || "")
          .trim()
          .toLowerCase(),
        rating: Number(payload?.rating || 0),
        review: String(payload?.review || "").trim(),
        createdAt: new Date(),
      };

      if (!data.productId) throw new Error("productId is required");
      if (!data.name) throw new Error("Name is required");
      if (!data.email) throw new Error("Email is required");
      if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }
      if (!data.review) throw new Error("Review is required");

      const docRef = await addDoc(collection(db, "productReviews"), data);
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error("Error adding product review:", error);
      throw error;
    }
  },

  async updateProduct(productId, productData) {
    try {
      const ref = doc(db, "products", String(productId));
      await updateDoc(ref, {
        ...productData,
        updatedAt: new Date(),
      });
      const snap = await getDoc(ref);
      return snap.exists() ? { id: snap.id, ...snap.data() } : { id: productId };
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  async deleteProduct(productId) {
    try {
      await deleteDoc(doc(db, "products", String(productId)));
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },
};

// Contacts Service (uses API)
function normalizeContactSubject(contactData) {
  const s =
    typeof contactData?.subject === "string" ? contactData.subject.trim() : "";
  return s.length ? s : "New contact form submission";
}

export const contactsService = {
  async submitContact(contactData) {
    try {
      return await contactsAPI.submit(contactData);
    } catch (error) {
      console.warn(
        "Contact API failed; attempting Firestore client fallback:",
        error?.message || error,
      );

      try {
        const submission = {
          name: String(contactData?.name ?? "").trim(),
          email: String(contactData?.email ?? "").trim().toLowerCase(),
          phone: String(contactData?.phone ?? "").trim(),
          subject: normalizeContactSubject(contactData),
          message: String(contactData?.message ?? "").trim(),
          submittedAt: new Date().toISOString(),
          read: false,
          savedViaClientFallback: true,
        };

        const docRef = await addDoc(collection(db, "contacts"), submission);

        return {
          success: true,
          submissionId: docRef.id,
          clientFallback: true,
          warning:
            "Your message was saved. Email confirmation could not be sent from the server (check Vercel email settings). We'll still receive your inquiry in the admin panel.",
        };
      } catch (fallbackError) {
        console.error(
          "Error submitting contact (API + fallback):",
          fallbackError,
        );

        const b = error?.apiBody || {};
        const persistErr = b?.persistence?.error;
        const userMail = b?.emailStatus?.user;
        const adminMail = b?.emailStatus?.admin;

        const parts = [error?.message].filter(Boolean);
        if (persistErr) parts.push(`Database: ${persistErr}`);
        if (userMail?.skipped)
          parts.push(
            userMail.reason
              ? `User email skipped: ${userMail.reason}`
              : "User email was not sent (SMTP may be unset)",
          );
        else if (!userMail?.ok && userMail?.reason)
          parts.push(`User email: ${userMail.reason}`);
        if (adminMail?.skipped)
          parts.push(
            adminMail.reason
              ? `Admin email skipped: ${adminMail.reason}`
              : "Admin email was not sent (SMTP may be unset)",
          );
        else if (!adminMail?.ok && adminMail?.reason)
          parts.push(`Admin email: ${adminMail.reason}`);
        if (fallbackError?.message)
          parts.push(`Save failed: ${fallbackError.message}`);

        const agg = parts.filter(Boolean).join(" ");
        const detailed = new Error(
          agg ||
            "Could not submit your message. Please email us directly or call +91 63859 39895.",
        );
        detailed.apiBody = b;
        detailed.fallbackError = fallbackError?.message || "";
        if (Array.isArray(b?.fixChecklist)) {
          console.error("Contact form — server fix checklist:", b.fixChecklist);
        }
        throw detailed;
      }
    }
  },

  async getContacts() {
    try {
      const q = query(collection(db, "contacts"), orderBy("submittedAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    } catch (error) {
      console.error("Error fetching contacts:", error);
      throw error;
    }
  },

  async updateContact(contactId, data) {
    try {
      const ref = doc(db, "contacts", String(contactId));
      await updateDoc(ref, {
        read: true,
        readAt: new Date(),
        updatedAt: new Date(),
      });
      return { id: contactId, ...data, read: true };
    } catch (error) {
      console.error("Error updating contact:", error);
      throw error;
    }
  },

  async deleteContact(contactId) {
    try {
      await deleteDoc(doc(db, "contacts", String(contactId)));
      return true;
    } catch (error) {
      console.error("Error deleting contact:", error);
      throw error;
    }
  },
};

// Categories Service (uses API)
export const categoriesService = {
  async getCategories() {
    try {
      const q = query(collection(db, "categories"), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  async uploadCategoryImage(file) {
    try {
      if (!file) return "";
      const timestamp = Date.now();
      const safeName = String(file.name || "category")
        .replace(/[^\w.\-]+/g, "_")
        .slice(0, 120);
      const fileName = `${timestamp}_${safeName}`;
      const storageRef = ref(storage, `categories/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error("Error uploading category image:", error);
      throw error;
    }
  },

  async getCategoryById(id) {
    try {
      const ref = doc(db, "categories", String(id));
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() };
    } catch (error) {
      console.error("Error fetching category:", error);
      throw error;
    }
  },

  async addCategory(categoryData) {
    try {
      const now = new Date();
      const payload = {
        name: String(categoryData?.name || "").trim(),
        description: String(categoryData?.description || "").trim(),
        image: String(categoryData?.image || "").trim(),
        createdAt: now,
        updatedAt: now,
      };
      if (!payload.name) throw new Error("Category name is required");
      const docRef = await addDoc(collection(db, "categories"), payload);
      return { id: docRef.id, ...payload };
    } catch (error) {
      console.error("Error adding category:", error);
      throw error;
    }
  },

  async updateCategory(id, categoryData) {
    try {
      const ref = doc(db, "categories", String(id));
      const update = {
        ...categoryData,
        updatedAt: new Date(),
      };
      await updateDoc(ref, update);
      const snap = await getDoc(ref);
      return snap.exists() ? { id: snap.id, ...snap.data() } : { id, ...update };
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  async deleteCategory(id) {
    try {
      await deleteDoc(doc(db, "categories", String(id)));
      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },
};

// Orders Service (uses API)
export const ordersService = {
  async sendOrderConfirmationEmail(order) {
    try {
      return await ordersAPI.sendConfirmationEmail(order);
    } catch (error) {
      console.error("Error sending order confirmation email:", error);
      return { success: false, emailSent: false, error: error.message };
    }
  },

  async sendOrderStatusEmail(order, status) {
    try {
      return await ordersAPI.sendStatusEmail(order, status);
    } catch (error) {
      console.error("Error sending order status email:", error);
      return { success: false, emailSent: false, error: error.message };
    }
  },

  async createOrder(orderData) {
    try {
      const now = new Date();
      const orderId = String(orderData?.id || `ORD-${Date.now()}`);
      const payload = {
        ...orderData,
        id: orderId,
        status: String(orderData?.status || "Paid"),
        createdAt: orderData?.createdAt || now,
        updatedAt: now,
      };

      const ref = doc(db, "orders", orderId);
      await setDoc(ref, payload, { merge: true });
      return payload;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  async getOrders() {
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  },

  async getOrderById(id) {
    try {
      const ref = doc(db, "orders", String(id));
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() };
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  },

  async updateOrderStatus(id, statusData) {
    try {
      const ref = doc(db, "orders", String(id));
      await updateDoc(ref, { ...statusData, updatedAt: new Date() });
      const snap = await getDoc(ref);
      const updatedOrder = snap.exists() ? { id: snap.id, ...snap.data() } : { id };
      const emailResult = await ordersService.sendOrderStatusEmail(
        updatedOrder,
        statusData?.status,
      );
      if (emailResult?.emailSent === false) {
        console.warn("Order status email not sent:", emailResult);
      }
      return updatedOrder;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },

  async deleteOrder(id) {
    try {
      await deleteDoc(doc(db, "orders", String(id)));
      return true;
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    }
  },
};

export const paymentsService = {
  async createRazorpayOrder(payload) {
    return paymentsAPI.createRazorpayOrder(payload);
  },
  async verifyRazorpayPayment(payload) {
    return paymentsAPI.verifyRazorpayPayment(payload);
  },
};

// Achievements Service
export const achievementsService = {
  async addAchievement(achievementData) {
    try {
      const docRef = await addDoc(collection(db, "achievements"), {
        ...achievementData,
        createdAt: new Date(),
      });
      return { id: docRef.id, ...achievementData };
    } catch (error) {
      console.error("Error adding achievement:", error);
      throw error;
    }
  },

  async getAchievements() {
    try {
      const q = query(
        collection(db, "achievements"),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching achievements:", error);
      throw error;
    }
  },

  async updateAchievement(achievementId, achievementData) {
    try {
      const achievementRef = doc(db, "achievements", achievementId);
      await updateDoc(achievementRef, {
        ...achievementData,
        updatedAt: new Date(),
      });
      return { id: achievementId, ...achievementData };
    } catch (error) {
      console.error("Error updating achievement:", error);
      throw error;
    }
  },

  async deleteAchievement(achievementId) {
    try {
      await deleteDoc(doc(db, "achievements", achievementId));
      return true;
    } catch (error) {
      console.error("Error deleting achievement:", error);
      throw error;
    }
  },
};

// Batches Service
export const batchesService = {
  async addBatch(batchData) {
    try {
      const docRef = await addDoc(collection(db, "batches"), {
        ...batchData,
        createdAt: new Date(),
      });
      return { id: docRef.id, ...batchData };
    } catch (error) {
      console.error("Error adding batch:", error);
      throw error;
    }
  },

  async getBatches() {
    try {
      const q = query(collection(db, "batches"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching batches:", error);
      throw error;
    }
  },

  async updateBatch(batchId, batchData) {
    try {
      const batchRef = doc(db, "batches", batchId);
      await updateDoc(batchRef, {
        ...batchData,
        updatedAt: new Date(),
      });
      return { id: batchId, ...batchData };
    } catch (error) {
      console.error("Error updating batch:", error);
      throw error;
    }
  },

  async deleteBatch(batchId) {
    try {
      await deleteDoc(doc(db, "batches", batchId));
      return true;
    } catch (error) {
      console.error("Error deleting batch:", error);
      throw error;
    }
  },
};

// Testimonials Service
export const testimonialsService = {
  async uploadFile(file, folder = "testimonials") {
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  },

  async deleteFile(fileURL) {
    try {
      const fileRef = ref(storage, fileURL);
      await deleteObject(fileRef);
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  },

  async addTestimonial(testimonialData) {
    try {
      const docRef = await addDoc(collection(db, "testimonials"), {
        ...testimonialData,
        createdAt: new Date(),
        isActive: true,
      });
      return { id: docRef.id, ...testimonialData };
    } catch (error) {
      console.error("Error adding testimonial:", error);
      throw error;
    }
  },

  async getTestimonials(activeOnly = false) {
    try {
      let q;
      if (activeOnly) {
        q = query(
          collection(db, "testimonials"),
          where("isActive", "==", true),
          orderBy("createdAt", "desc"),
        );
      } else {
        q = query(collection(db, "testimonials"), orderBy("createdAt", "desc"));
      }
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      throw error;
    }
  },

  async getTestimonialById(testimonialId) {
    try {
      const docRef = doc(db, "testimonials", testimonialId);
      const docSnap = await getDocs(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching testimonial:", error);
      throw error;
    }
  },

  async updateTestimonial(testimonialId, testimonialData) {
    try {
      const testimonialRef = doc(db, "testimonials", testimonialId);
      await updateDoc(testimonialRef, {
        ...testimonialData,
        updatedAt: new Date(),
      });
      return { id: testimonialId, ...testimonialData };
    } catch (error) {
      console.error("Error updating testimonial:", error);
      throw error;
    }
  },

  async deleteTestimonial(testimonialId) {
    try {
      await deleteDoc(doc(db, "testimonials", testimonialId));
      return true;
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      throw error;
    }
  },

  async toggleTestimonialActive(testimonialId, isActive) {
    try {
      const testimonialRef = doc(db, "testimonials", testimonialId);
      await updateDoc(testimonialRef, { isActive });
      return true;
    } catch (error) {
      console.error("Error toggling testimonial:", error);
      throw error;
    }
  },
};

const OFFER_TICKER_DOC = { collection: "siteSettings", id: "offerTicker" };

/** Shown until `siteSettings/offerTicker` exists; replace via Admin → Offer ticker. */
export const OFFER_TICKER_FALLBACK_MESSAGES = [
  "TNPSC Group I, II & Statistical Services coaching — Admissions open!",
  "Call +91 63859 39895 • karthikeyananalysisstudycircle@gmail.com • Uthamar Gandhi Road, Chennai",
];

export const offerTickerService = {
  getDefaultSettings() {
    return {
      enabled: true,
      messages: [...OFFER_TICKER_FALLBACK_MESSAGES],
    };
  },

  normalizeMessages(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
      .map((m) => String(m ?? "").trim())
      .filter(Boolean);
  },

  async getOfferTicker() {
    try {
      const ref = doc(db, OFFER_TICKER_DOC.collection, OFFER_TICKER_DOC.id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return this.getDefaultSettings();
      const data = snap.data();
      const messages = this.normalizeMessages(data.messages);
      const enabled = !!data.enabled && messages.length > 0;
      return { enabled, messages };
    } catch (error) {
      console.error("Error fetching offer ticker:", error);
      /* Bad rules/offline — still show fallback so visitors see offers */
      return this.getDefaultSettings();
    }
  },

  subscribeOfferTicker(callback) {
    const ref = doc(db, OFFER_TICKER_DOC.collection, OFFER_TICKER_DOC.id);
    return onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          callback(offerTickerService.getDefaultSettings());
          return;
        }
        const data = snap.data();
        const messages = offerTickerService.normalizeMessages(data.messages);
        const enabled = !!data.enabled && messages.length > 0;
        callback({ enabled, messages });
      },
      (error) => {
        console.error("Offer ticker subscription error:", error);
        callback(offerTickerService.getDefaultSettings());
      },
    );
  },

  async saveOfferTicker({ enabled, messages }) {
    try {
      const ref = doc(db, OFFER_TICKER_DOC.collection, OFFER_TICKER_DOC.id);
      const cleaned = this.normalizeMessages(messages);
      await setDoc(
        ref,
        {
          enabled: !!enabled && cleaned.length > 0,
          messages: cleaned,
          updatedAt: new Date(),
        },
        { merge: true },
      );
      return { enabled: !!enabled && cleaned.length > 0, messages: cleaned };
    } catch (error) {
      console.error("Error saving offer ticker:", error);
      throw error;
    }
  },
};
