const Expense = require("../models/Expense");

async function createExpense(req, res) {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json({ success: true, expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function listExpenses(req, res) {
  try {
    const filter = {};
    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) filter.date.$gte = new Date(req.query.from);
      if (req.query.to) filter.date.$lte = new Date(req.query.to);
    }
    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json({ success: true, expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteExpense(req, res) {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Expense delete ho gaya." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { createExpense, listExpenses, deleteExpense };
