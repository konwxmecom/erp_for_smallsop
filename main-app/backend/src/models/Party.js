const mongoose = require("mongoose");

const partySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["customer", "supplier"], required: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    // Outstanding balance:
    //   type=customer -> positive balance = customer owes the shop (udhaar diya)
    //   type=supplier -> positive balance = shop owes the supplier (udhaar liya)
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Party", partySchema);
