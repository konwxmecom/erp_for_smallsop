const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    party: { type: mongoose.Schema.Types.ObjectId, ref: "Party", required: true },
    amount: { type: Number, required: true, min: 0.01 },
    // "received"  -> "jama karo" (customer paid us)
    // "made"      -> "chuka do"  (we paid a supplier)
    direction: { type: String, enum: ["received", "made"], required: true },
    relatedTransactionType: { type: String, enum: ["sale", "purchase", "none"], default: "none" },
    relatedTransactionId: { type: mongoose.Schema.Types.ObjectId, default: null },
    note: { type: String, trim: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
