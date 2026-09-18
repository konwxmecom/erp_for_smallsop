const express = require("express");
const { body, validationResult } = require("express-validator");
const { register, login, verify, refreshToken, logout } = require("../controllers/authController");
const { loginLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

router.post(
  "/register",
  [
    body("shopName").trim().notEmpty().withMessage("Shop ka naam zaroori hai."),
    body("name").trim().notEmpty().withMessage("Naam zaroori hai."),
    body("email").isEmail().withMessage("Valid email dein."),
    body("password").isLength({ min: 6 }).withMessage("Password kam se kam 6 characters ka ho."),
  ],
  handleValidation,
  register
);

router.post(
  "/login",
  loginLimiter,
  [
    body("email").isEmail().withMessage("Valid email dein."),
    body("password").notEmpty().withMessage("Password zaroori hai."),
  ],
  handleValidation,
  login
);

router.get("/verify", verify);

router.post("/refresh-token", refreshToken);

router.post("/logout", logout);

module.exports = router;
