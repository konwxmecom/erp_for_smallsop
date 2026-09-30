require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
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

function validateConfiguration() {
  const required = ["MONGO_URI", "AUTH_SERVICE_URL", "CORS_ORIGIN"];
  for (const name of required) {
    if (!process.env[name]) throw new Error(`${name} must be configured.`);
  }
  const authServiceUrl = new URL(process.env.AUTH_SERVICE_URL);
  if (!["http:", "https:"].includes(authServiceUrl.protocol)) {
    throw new Error("AUTH_SERVICE_URL must use HTTP or HTTPS.");
  }
  if (
    process.env.NODE_ENV === "production" &&
    authServiceUrl.protocol !== "https:"
  ) {
    throw new Error("AUTH_SERVICE_URL must use HTTPS in production.");
  }

  const origins = process.env.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (!origins.length || origins.includes("*"))
    throw new Error("CORS_ORIGIN must list explicit origins.");
  for (const origin of origins) {
    const parsed = new URL(origin);
    if (
      parsed.origin !== origin ||
      (process.env.NODE_ENV === "production" && parsed.protocol !== "https:")
    ) {
      throw new Error(
        "CORS_ORIGIN must contain valid origins and use HTTPS in production.",
      );
    }
  }
  return origins;
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true);
      return callback(new Error("Origin not allowed."));
    },
  }),
);
app.use(express.json({ limit: "32kb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/health", (req, res) =>
  res.json({ status: "main-app backend running" }),
);

app.use("/api", apiLimiter);
app.use("/api/groups", groupRoutes);
app.use("/api/products", productRoutes);
app.use("/api/parties", partyRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/reports", reportRoutes);

app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found." }),
);

app.use((err, req, res, next) => {
  if (err.message === "Origin not allowed.") {
    return res
      .status(403)
      .json({ success: false, message: "Origin not allowed." });
  }
  if (err.type === "entity.too.large") {
    return res
      .status(413)
      .json({ success: false, message: "Request body too large." });
  }
  if (err instanceof SyntaxError && "body" in err) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid JSON body." });
  }
  return res
    .status(500)
    .json({ success: false, message: "Internal server error." });
});

const PORT = process.env.PORT || 5001;
let allowedOrigins;

async function start() {
  allowedOrigins = validateConfiguration();
  await connectDB();
  app.listen(PORT, () =>
    console.log(`[main-app] backend running on port ${PORT}`),
  );
}

start().catch(() => {
  console.error(
    "[main-app] startup failed; check environment configuration and database connectivity.",
  );
  process.exit(1);
});
