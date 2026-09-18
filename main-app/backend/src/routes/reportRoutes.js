const express = require("express");
const checkAuth = require("../middleware/checkAuth");
const { daybook, dailyPnl, topProducts, dashboard } = require("../controllers/reportController");

const router = express.Router();

router.use(checkAuth);
router.get("/daybook", daybook);
router.get("/daily-pnl", dailyPnl);
router.get("/top-products", topProducts);
router.get("/dashboard", dashboard);

module.exports = router;
