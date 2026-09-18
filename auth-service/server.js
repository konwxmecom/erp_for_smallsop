require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");

const app = express();

connectDB();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "auth-service running" }));
app.use("/", authRoutes);

app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found." }),
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`[auth-service] running on http://localhost:${PORT}`),
);
