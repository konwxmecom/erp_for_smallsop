const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/tokens");

function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// POST /register
async function register(req, res) {
  try {
    const { shopName, name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Ye email pehle se registered hai." });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      shopName,
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Account ban gaya. Ab login karein.",
      user: {
        id: user._id,
        shopName: user.shopName,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Server error during registration." });
  }
}

// POST /login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Email ya password galat hai." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Email ya password galat hai." });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokenHash = hashRefreshToken(refreshToken);
    await user.save();

    return res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        shopName: user.shopName,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Server error during login." });
  }
}

// GET /verify  -- called by main-app's checkAuth middleware with Authorization: Bearer <accessToken>
function verify(req, res) {
  const authHeader = req.headers["authorization"];
  const [scheme, token, ...extra] = (authHeader || "").split(" ");

  if (scheme !== "Bearer" || !token || extra.length) {
    return res.status(401).json({ success: false, message: "Token missing." });
  }

  jwt.verify(
    token,
    process.env.JWT_ACCESS_SECRET,
    { algorithms: ["HS256"] },
    (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ success: false, message: "Token invalid ya expired." });
      }
      if (typeof decoded.id !== "string" || !decoded.id) {
        return res
          .status(403)
          .json({ success: false, message: "Token invalid ya expired." });
      }
      return res.json({ success: true, user: decoded });
    },
  );
}

// POST /refresh-token
async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token missing." });
    }

    if (typeof refreshToken !== "string" || refreshToken.length > 4096) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token invalid hai." });
    }

    const user = await User.findOne({
      refreshTokenHash: hashRefreshToken(refreshToken),
    }).select("+refreshTokenHash");
    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "Refresh token invalid hai." });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, {
        algorithms: ["HS256"],
      });
    } catch {
      return res
        .status(403)
        .json({ success: false, message: "Refresh token expired." });
    }
    if (decoded.id !== user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Refresh token invalid hai." });
    }

    const newRefreshToken = generateRefreshToken(user);
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id, refreshTokenHash: hashRefreshToken(refreshToken) },
      { $set: { refreshTokenHash: hashRefreshToken(newRefreshToken) } },
      { new: true },
    );
    if (!updatedUser) {
      return res
        .status(403)
        .json({ success: false, message: "Refresh token already used." });
    }

    return res.json({
      success: true,
      accessToken: generateAccessToken(user),
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Server error during token refresh." });
  }
}

// POST /logout
async function logout(req, res) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      if (typeof refreshToken === "string" && refreshToken.length <= 4096) {
        await User.findOneAndUpdate(
          { refreshTokenHash: hashRefreshToken(refreshToken) },
          { $set: { refreshTokenHash: null } },
        );
      }
    }
    return res.json({ success: true, message: "Logout ho gaya." });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Server error during logout." });
  }
}

module.exports = { register, login, verify, refreshToken, logout };
