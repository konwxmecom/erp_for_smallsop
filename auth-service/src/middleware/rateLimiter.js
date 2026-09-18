const rateLimit = require("express-rate-limit");

// Brute-force protection on login: max 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Bahut zyada login attempts ho gaye. 15 minute baad try karein.",
  },
});

module.exports = { loginLimiter };
