const express = require("express");
const router = express.Router();
const multer = require("multer");
const Product = require("../models/Product");

// Configure Multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save files in the uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Unique file names
  },
});
const upload = multer({ storage: storage });

// POST: Add a new product
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { productName, description, price } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!productName || !price || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newProduct = new Product({
      productName,
      description,
      price,
      imageUrl,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", newProduct });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Failed to add product", error });
  }
});
// DELETE: Remove a product by ID
router.delete("/:id", async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Server Error:", error);
      res.status(500).json({ message: "Failed to delete product", error });
    }
  });
  

// GET: Fetch all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Failed to fetch products", error });
  }
});

module.exports = router;
