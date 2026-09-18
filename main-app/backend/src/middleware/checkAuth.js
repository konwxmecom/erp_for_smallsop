const axios = require("axios");

// Verifies the incoming JWT by calling auth-service's /verify endpoint.
// This is how main-app stays decoupled from auth-service's internals.
async function checkAuth(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Login zaroori hai." });
    }

    const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/verify`, {
      headers: { Authorization: authHeader },
    });

    if (!response.data.success) {
      return res.status(401).json({ success: false, message: "Session invalid hai. Dobara login karein." });
    }

    req.user = response.data.user; // { id, email, role }
    next();
  } catch (err) {
    // auth-service returned 401/403, or is unreachable
    return res.status(401).json({ success: false, message: "Session expired ya invalid. Dobara login karein." });
  }
}

module.exports = checkAuth;
