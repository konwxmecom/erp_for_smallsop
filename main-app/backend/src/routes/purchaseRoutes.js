const express = require("express");
const checkAuth = require("../middleware/checkAuth");
const { createPurchase, listPurchases } = require("../controllers/purchaseController");

const router = express.Router();

router.use(checkAuth);
router.post("/", createPurchase);
router.get("/", listPurchases);

module.exports = router;
