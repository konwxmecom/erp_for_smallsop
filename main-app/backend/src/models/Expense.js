const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true }, // rent, salary, bijli bill, etc.
    amount: { type: Number, required: true, min: 0 },
    note: { type: String, trim: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
