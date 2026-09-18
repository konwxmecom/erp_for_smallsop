const Product = require("../models/Product");

async function createProduct(req, res) {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function listProducts(req, res) {
  try {
    const products = await Product.find().populate("group").sort({ name: 1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getLowStockProducts(req, res) {
  try {
    const products = await Product.find({ $expr: { $lte: ["$stockQty", "$lowStockThreshold"] } });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateProduct(req, res) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "Product nahi mila." });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteProduct(req, res) {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product delete ho gaya." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { createProduct, listProducts, getLowStockProducts, updateProduct, deleteProduct };
