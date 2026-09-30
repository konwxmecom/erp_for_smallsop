const Product = require("../models/Product");
const Group = require("../models/Group");

async function createProduct(req, res) {
  try {
    const {
      name,
      group,
      gstPercent,
      hsnCode,
      unit,
      stockQty,
      lowStockThreshold,
      purchasePrice,
      salePrice,
    } = req.body;
    if (
      group &&
      !(await Group.exists({
        _id: group,
        ownerId: req.user.id,
      }))
    ) {
      return res
        .status(404)
        .json({ success: false, message: "Group nahi mila." });
    }
    const product = await Product.create({
      ownerId: req.user.id,
      name,
      group,
      gstPercent,
      hsnCode,
      unit,
      stockQty,
      lowStockThreshold,
      purchasePrice,
      salePrice,
    });
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function listProducts(req, res) {
  try {
    const products = await Product.find({ ownerId: req.user.id })
      .populate({ path: "group", match: { ownerId: req.user.id } })
      .sort({ name: 1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getLowStockProducts(req, res) {
  try {
    const products = await Product.find({
      ownerId: req.user.id,
      $expr: { $lte: ["$stockQty", "$lowStockThreshold"] },
    });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateProduct(req, res) {
  try {
    const {
      name,
      group,
      gstPercent,
      hsnCode,
      unit,
      stockQty,
      lowStockThreshold,
      purchasePrice,
      salePrice,
    } = req.body;
    if (
      group &&
      !(await Group.exists({
        _id: group,
        ownerId: req.user.id,
      }))
    ) {
      return res
        .status(404)
        .json({ success: false, message: "Group nahi mila." });
    }
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.id },
      {
        $set: {
          name,
          group,
          gstPercent,
          hsnCode,
          unit,
          stockQty,
          lowStockThreshold,
          purchasePrice,
          salePrice,
        },
      },
      { new: true, runValidators: true },
    );
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product nahi mila." });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteProduct(req, res) {
  try {
    await Product.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user.id,
    });
    res.json({ success: true, message: "Product delete ho gaya." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  createProduct,
  listProducts,
  getLowStockProducts,
  updateProduct,
  deleteProduct,
};
