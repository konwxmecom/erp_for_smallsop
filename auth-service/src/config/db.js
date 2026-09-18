const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("[auth-service] MongoDB connected");
  } catch (err) {
    console.error("[auth-service] MongoDB connection failed:", err);
    process.exit(1);
  }
}

module.exports = connectDB;
