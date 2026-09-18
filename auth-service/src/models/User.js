const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    shopName: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // bcrypt hash
    role: { type: String, enum: ["owner", "staff"], default: "owner" },
    refreshToken: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
