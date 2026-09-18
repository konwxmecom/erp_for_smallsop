const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    rate: { type: Number, required: true, min: 0 },
    gstPercent: { type: Number, default: 0 },
    costPriceAtSale: { type: Number, required: true }, // snapshot for P&L (COGS)
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    party: { type: mongoose.Schema.Types.ObjectId, ref: "Party", required: true }, // customer
    items: { type: [saleItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    paymentType: { type: String, enum: ["cash", "udhaar"], required: true },
    paymentStatus: { type: String, enum: ["paid", "partial", "unpaid"], default: "unpaid" },
    amountPaid: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", saleSchema);
