require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");

const app = express();

function validateConfiguration() {
  const required = [
    "MONGO_URI",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "CORS_ORIGIN",
  ];
  for (const name of required) {
    if (!process.env[name]) throw new Error(`${name} must be configured.`);
  }
  if (
    Buffer.byteLength(process.env.JWT_ACCESS_SECRET) < 32 ||
    Buffer.byteLength(process.env.JWT_REFRESH_SECRET) < 32
  ) {
    throw new Error("JWT secrets must each contain at least 32 bytes.");
  }
  if (process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT access and refresh secrets must be different.");
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

app.get("/health", (req, res) => res.json({ status: "auth-service running" }));
app.use("/", authRoutes);

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

const PORT = process.env.PORT || 5000;
let allowedOrigins;

async function start() {
  allowedOrigins = validateConfiguration();
  await connectDB();
  app.listen(PORT, () => console.log(`[auth-service] running on port ${PORT}`));
}

start().catch(() => {
  console.error(
    "[auth-service] startup failed; check environment configuration and database connectivity.",
  );
  process.exit(1);
});
