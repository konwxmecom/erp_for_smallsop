const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("[auth-service] MongoDB connected");
  } catch (err) {
    console.error("[auth-service] MongoDB connection failed.");
    throw err;
  }
}

module.exports = connectDB;
