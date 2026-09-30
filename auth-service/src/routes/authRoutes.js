const express = require("express");
const { body, validationResult } = require("express-validator");
const {
  register,
  login,
  verify,
  refreshToken,
  logout,
} = require("../controllers/authController");
const {
  authLimiter,
  loginLimiter,
  registrationLimiter,
} = require("../middleware/rateLimiter");

const router = express.Router();
router.use(authLimiter);

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

router.post(
  "/register",
  registrationLimiter,
  [
    body("shopName")
      .trim()
      .isLength({ min: 1, max: 120 })
      .withMessage("Shop ka naam valid dein."),
    body("name")
      .trim()
      .isLength({ min: 1, max: 120 })
      .withMessage("Naam valid dein."),
    body("email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email dein."),
    body("password")
      .isLength({ min: 12, max: 72 })
      .withMessage("Password 12 se 72 characters ka hona chahiye."),
  ],
  handleValidation,
  register,
);

router.post(
  "/login",
  loginLimiter,
  [
    body("email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email dein."),
    body("password").notEmpty().withMessage("Password zaroori hai."),
  ],
  handleValidation,
  login,
);

router.get("/verify", verify);

router.post("/refresh-token", refreshToken);

router.post("/logout", logout);

module.exports = router;
