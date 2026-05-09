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
import { categoriesAPI, contactsAPI, ordersAPI, paymentsAPI, productsAPI } from "./api";

// Products Service
export const productsService = {
  async addProduct(productData) {
    try {
      return await productsAPI.create(productData);
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  },

  async getProducts() {
    try {
      return await productsAPI.getAll();
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  async updateProduct(productId, productData) {
    try {
      return await productsAPI.update(productId, productData);
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  async deleteProduct(productId) {
    try {
      await productsAPI.delete(productId);
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },
};

// Contacts Service (uses API)
export const contactsService = {
  async submitContact(contactData) {
    try {
      return await contactsAPI.submit(contactData);
    } catch (error) {
      console.error("Error submitting contact:", error);
      throw error;
    }
  },

  async getContacts() {
    try {
      const q = query(
        collection(db, "contacts"),
        orderBy("submittedAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      return await contactsAPI.getAll();
    } catch (error) {
      console.error("Error fetching contacts:", error);
      throw error;
    }
  },

  async updateContact(contactId, data) {
    try {
      await contactsAPI.markAsRead(contactId);
      return { id: contactId, ...data };
    } catch (error) {
      console.error("Error updating contact:", error);
      throw error;
    }
  },

  async deleteContact(contactId) {
    try {
      await contactsAPI.delete(contactId);
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
      return await categoriesAPI.getAll();
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  async getCategoryById(id) {
    try {
      return await categoriesAPI.getById(id);
    } catch (error) {
      console.error("Error fetching category:", error);
      throw error;
    }
  },

  async addCategory(categoryData) {
    try {
      return await categoriesAPI.create(categoryData);
    } catch (error) {
      console.error("Error adding category:", error);
      throw error;
    }
  },

  async updateCategory(id, categoryData) {
    try {
      return await categoriesAPI.update(id, categoryData);
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  async deleteCategory(id) {
    try {
      return await categoriesAPI.delete(id);
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },
};

// Orders Service (uses API)
export const ordersService = {
  async createOrder(orderData) {
    try {
      return await ordersAPI.create(orderData);
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  async getOrders() {
    try {
      return await ordersAPI.getAll();
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  },

  async getOrderById(id) {
    try {
      return await ordersAPI.getById(id);
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  },

  async updateOrderStatus(id, statusData) {
    try {
      return await ordersAPI.updateStatus(id, statusData);
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },

  async deleteOrder(id) {
    try {
      return await ordersAPI.delete(id);
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
