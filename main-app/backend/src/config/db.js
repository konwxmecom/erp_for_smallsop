const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("[main-app] MongoDB connected");
  } catch (err) {
    console.error("[main-app] MongoDB connection failed.");
    throw err;
  }
}
module.exports = connectDB;
