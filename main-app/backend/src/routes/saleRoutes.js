const express = require("express");
const checkAuth = require("../middleware/checkAuth");
const { createSale, listSales } = require("../controllers/saleController");

const router = express.Router();

router.use(checkAuth);
router.post("/", createSale);
router.get("/", listSales);

module.exports = router;
