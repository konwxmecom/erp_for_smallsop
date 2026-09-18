const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    rate: { type: Number, required: true, min: 0 },
    gstPercent: { type: Number, default: 0 },
  },
  { _id: false }
);

const purchaseSchema = new mongoose.Schema(
  {
    party: { type: mongoose.Schema.Types.ObjectId, ref: "Party", required: true }, // supplier
    items: { type: [purchaseItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    paymentType: { type: String, enum: ["cash", "udhaar"], required: true },
    paymentStatus: { type: String, enum: ["paid", "partial", "unpaid"], default: "unpaid" },
    amountPaid: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Purchase", purchaseSchema);
