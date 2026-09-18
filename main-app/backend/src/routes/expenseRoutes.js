const express = require("express");
const checkAuth = require("../middleware/checkAuth");
const { createExpense, listExpenses, deleteExpense } = require("../controllers/expenseController");

const router = express.Router();

router.use(checkAuth);
router.post("/", createExpense);
router.get("/", listExpenses);
router.delete("/:id", deleteExpense);

module.exports = router;
