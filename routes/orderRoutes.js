const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Place Order (User)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, address, phone, paymentMethod, cartItems, totalPrice } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty!" });
    }

    const items = await Promise.all(
      cartItems.map(async (item) => {
        const product = await Product.findById(item.productId);
        return {
          productId: item.productId,
          sellerId: product.sellerId, // ✅ Store sellerId inside items
          name: item.name,
          price: item.price,
          quantity: item.qty,
          image: item.imgUrl || "/uploads/default.png",
        };
      })
    );

    const order = new Order({
      userId: req.userId,
      items,
      totalPrice,
      shippingAddress: address,
      phone,
      paymentMethod,
      status: "Pending",
    });

    await order.save();
    res.status(201).json({ message: "Order placed successfully!", order });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


// ✅ Get Orders for a User
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).populate("items.productId", "name price imageUrl");
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});
//seller orders only
router.get("/seller-orders", authMiddleware, async (req, res) => {
  try {
    if (req.role !== "seller") {
      return res.status(403).json({ message: "Access denied" });
    }

    const orders = await Order.find({ "items.sellerId": req.userId })
      .populate("items.productId", "name price imageUrl sellerId")
      .populate("userId", "name email");

    // ✅ Log orders to verify data before sending response
    console.log("Fetched Seller Orders:", JSON.stringify(orders, null, 2));

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});




// ✅ Get All Orders for Admin
router.get("/admin-orders", authMiddleware, async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("items.productId", "name price imageUrl");

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Update Order Status (For Sellers)
router.put("/update-status/:orderId/:productId", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Processing", "Shipped", "Delivered"].includes(status)) {
      return res.status(400).json({ message: "Invalid status update" });
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.orderId, "items.productId": req.params.productId, "items.sellerId": req.userId },
      { $set: { "items.$.status": status } },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found or unauthorized" });

    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to update order", error: error.message });
  }
});
router.delete("/:orderId", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, userId: req.userId });

    if (!order) return res.status(404).json({ message: "Order not found!" });

    // ✅ Prevent cancellation if already shipped/delivered
    if (order.status === "Delivered") {
      return res.status(400).json({ message: "Delivered orders cannot be canceled." });
    }

    await Order.findByIdAndDelete(req.params.orderId);
    res.status(200).json({ message: "Order canceled successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});


module.exports = router;
