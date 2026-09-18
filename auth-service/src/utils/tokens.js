const jwt = require("jsonwebtoken");

function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m" }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d" }
  );
}

module.exports = { generateAccessToken, generateRefreshToken };
