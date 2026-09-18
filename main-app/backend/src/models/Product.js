const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    gstPercent: { type: Number, default: 0 },
    hsnCode: { type: String, trim: true },
    unit: { type: String, default: "pcs" }, // pcs, kg, litre, etc.
    stockQty: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    purchasePrice: { type: Number, default: 0 },
    salePrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
