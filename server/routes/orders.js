import express from "express";
import { db } from "../config/firebase.js";
import {
  sendOrderConfirmation,
  sendOrderShipped,
  sendOrderDelivered,
} from "../config/email.js";

const router = express.Router();

// Create order
router.post("/", async (req, res) => {
  try {
    const { customerName, customerEmail, items, total, address } = req.body;

    if (!customerName || !customerEmail || !items || !total) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const docRef = await db.collection("orders").add({
      customerName,
      customerEmail,
      items,
      total,
      address,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const orderId = docRef.id;

    // Send order confirmation email
    await sendOrderConfirmation({
      orderId,
      customerName,
      customerEmail,
      items,
      total,
      orderDate: new Date(),
    });

    res.status(201).json({
      success: true,
      orderId,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all orders
router.get("/", async (req, res) => {
  try {
    const snapshot = await db
      .collection("orders")
      .orderBy("createdAt", "desc")
      .get();

    const orders = [];
    snapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID
router.get("/:id", async (req, res) => {
  try {
    const doc = await db.collection("orders").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update order status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status, trackingNumber, expectedDelivery, deliveredDate } =
      req.body;

    const orderRef = db.collection("orders").doc(req.params.id);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: "Order not found" });
    }

    const orderData = orderDoc.data();

    // Update order status
    await orderRef.update({
      status,
      trackingNumber: trackingNumber || orderData.trackingNumber || null,
      expectedDelivery: expectedDelivery || orderData.expectedDelivery || null,
      deliveredDate: deliveredDate || orderData.deliveredDate || null,
      updatedAt: new Date(),
    });

    // Send appropriate email based on status
    if (status === "shipped") {
      await sendOrderShipped({
        orderId: req.params.id,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        trackingNumber,
        expectedDelivery,
      });
    } else if (status === "delivered") {
      await sendOrderDelivered({
        orderId: req.params.id,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        deliveredDate: new Date(),
        deliveryAddress: orderData.address,
      });
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete order
router.delete("/:id", async (req, res) => {
  try {
    await db.collection("orders").doc(req.params.id).delete();
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
