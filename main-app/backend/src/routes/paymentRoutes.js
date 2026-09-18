const express = require("express");
const checkAuth = require("../middleware/checkAuth");
const { receivePayment, makePayment, listPayments } = require("../controllers/paymentController");

const router = express.Router();

router.use(checkAuth);
router.post("/receive", receivePayment); // jama karo
router.post("/pay", makePayment); // chuka do
router.get("/", listPayments);

module.exports = router;
