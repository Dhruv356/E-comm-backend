const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get User Profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// 🟢 Update User Profile (Address, Phone, Shipping Address, etc.)
router.post("/profile", authMiddleware, async (req, res) => {
  try {
    const { address, phoneNumber, shippingAddress } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { address, phoneNumber, shippingAddress },
      { new: true } // Returns updated user
    );

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});
// Update Address
router.post("/update-address", authMiddleware, async (req, res) => {
  const { address } = req.body;
  await User.findByIdAndUpdate(req.userId, { address });
  res.json({ message: "Address updated successfully" });
});

// Update Phone Number
router.post("/update-phone-number", authMiddleware, async (req, res) => {
  const { phoneNumber } = req.body;
  await User.findByIdAndUpdate(req.userId, { phoneNumber });
  res.json({ message: "Phone number updated successfully" });
});

// Update Shipping Address
router.post("/update-shipping-address", authMiddleware, async (req, res) => {
  const { shippingAddress } = req.body;
  await User.findByIdAndUpdate(req.userId, { shippingAddress });
  res.json({ message: "Shipping address updated successfully" });
});

module.exports = router;
