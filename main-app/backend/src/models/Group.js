const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Grains"
    localName: { type: String, trim: true }, // e.g. "अनाज"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);
