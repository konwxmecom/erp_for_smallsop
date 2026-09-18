require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./src/config/db");

const groupRoutes = require("./src/routes/groupRoutes");
const productRoutes = require("./src/routes/productRoutes");
const partyRoutes = require("./src/routes/partyRoutes");
const purchaseRoutes = require("./src/routes/purchaseRoutes");
const saleRoutes = require("./src/routes/saleRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const expenseRoutes = require("./src/routes/expenseRoutes");
const reportRoutes = require("./src/routes/reportRoutes");

const app = express();

connectDB();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ status: "main-app backend running" }));

app.use("/api/groups", groupRoutes);
app.use("/api/products", productRoutes);
app.use("/api/parties", partyRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/reports", reportRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found." }));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`[main-app] backend running on http://localhost:${PORT}`));
