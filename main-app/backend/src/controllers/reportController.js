const Sale = require("../models/Sale");
const Purchase = require("../models/Purchase");
const Payment = require("../models/Payment");
const Expense = require("../models/Expense");
const Party = require("../models/Party");
const Product = require("../models/Product");
const mongoose = require("mongoose");

function dayRange(dateStr) {
  const date = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(date.setHours(0, 0, 0, 0));
  const end = new Date(date.setHours(23, 59, 59, 999));
  return { start, end };
}

// GET /api/reports/daybook?date=YYYY-MM-DD
async function daybook(req, res) {
  try {
    const { start, end } = dayRange(req.query.date);
    const filter = { ownerId: req.user.id, date: { $gte: start, $lte: end } };

    const [sales, purchases, payments, expenses] = await Promise.all([
      Sale.find(filter)
        .populate({ path: "party", match: { ownerId: req.user.id } })
        .populate({ path: "items.product", match: { ownerId: req.user.id } }),
      Purchase.find(filter)
        .populate({ path: "party", match: { ownerId: req.user.id } })
        .populate({ path: "items.product", match: { ownerId: req.user.id } }),
      Payment.find(filter).populate({
        path: "party",
        match: { ownerId: req.user.id },
      }),
      Expense.find(filter),
    ]);

    res.json({
      success: true,
      date: start,
      sales,
      purchases,
      payments,
      expenses,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/reports/daily-pnl?date=YYYY-MM-DD
async function dailyPnl(req, res) {
  try {
    const { start, end } = dayRange(req.query.date);
    const filter = { ownerId: req.user.id, date: { $gte: start, $lte: end } };

    const sales = await Sale.find(filter);
    const expenses = await Expense.find(filter);

    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const costOfGoodsSold = sales.reduce((sum, s) => {
      const saleCost = s.items.reduce(
        (iSum, i) => iSum + i.costPriceAtSale * i.quantity,
        0,
      );
      return sum + saleCost;
    }, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const profit = totalSales - costOfGoodsSold - totalExpenses;

    res.json({
      success: true,
      date: start,
      totalSales,
      costOfGoodsSold,
      totalExpenses,
      profit,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/reports/top-products?from=&to=&limit=5
async function topProducts(req, res) {
  try {
    const filter = { ownerId: req.user.id };
    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) filter.date.$gte = new Date(req.query.from);
      if (req.query.to) filter.date.$lte = new Date(req.query.to);
    }
    const requestedLimit = Number.parseInt(req.query.limit, 10) || 5;
    const limit = Math.min(Math.max(requestedLimit, 1), 100);

    const sales = await Sale.find(filter);
    const tally = {};

    for (const sale of sales) {
      for (const item of sale.items) {
        const key = item.product.toString();
        if (!tally[key])
          tally[key] = { productId: key, quantitySold: 0, revenue: 0 };
        tally[key].quantitySold += item.quantity;
        tally[key].revenue += item.quantity * item.rate;
      }
    }

    const ranked = Object.values(tally)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, limit);

    for (const row of ranked) {
      const product = await Product.findOne({
        _id: row.productId,
        ownerId: req.user.id,
      });
      row.productName = product ? product.name : "Unknown";
    }

    res.json({ success: true, topProducts: ranked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/reports/dashboard  -- aaj ki sale, purchase, profit, low stock alert count
async function dashboard(req, res) {
  try {
    const { start, end } = dayRange();
    const filter = { ownerId: req.user.id, date: { $gte: start, $lte: end } };

    const [sales, purchases, expenses] = await Promise.all([
      Sale.find(filter),
      Purchase.find(filter),
      Expense.find(filter),
    ]);

    const todaySales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const todayPurchases = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const cogs = sales.reduce(
      (sum, s) =>
        sum +
        s.items.reduce((iSum, i) => iSum + i.costPriceAtSale * i.quantity, 0),
      0,
    );
    const todayExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const todayProfit = todaySales - cogs - todayExpenses;

    const lowStockCount = await Product.countDocuments({
      ownerId: req.user.id,
      $expr: { $lte: ["$stockQty", "$lowStockThreshold"] },
    });

    const totalReceivable = await Party.aggregate([
      {
        $match: {
          ownerId: new mongoose.Types.ObjectId(req.user.id),
          type: "customer",
        },
      },
      { $group: { _id: null, total: { $sum: "$balance" } } },
    ]);
    const totalPayable = await Party.aggregate([
      {
        $match: {
          ownerId: new mongoose.Types.ObjectId(req.user.id),
          type: "supplier",
        },
      },
      { $group: { _id: null, total: { $sum: "$balance" } } },
    ]);

    res.json({
      success: true,
      todaySales,
      todayPurchases,
      todayProfit,
      lowStockCount,
      totalReceivable: totalReceivable[0]?.total || 0,
      totalPayable: totalPayable[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { daybook, dailyPnl, topProducts, dashboard };
