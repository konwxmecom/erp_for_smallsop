const mongoose = require("mongoose");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Party = require("../models/Party");

// POST /api/sales
// Body: { party, items: [{product, quantity, rate, gstPercent}], paymentType, amountPaid }
async function createSale(req, res) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { party, items, paymentType, amountPaid = 0 } = req.body;

    if (!items || !items.length) {
      throw new Error("Kam se kam ek product add karein.");
    }

    let totalAmount = 0;
    const itemsWithCost = [];

    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) throw new Error("Product nahi mila.");

      if (product.stockQty < item.quantity) {
        throw new Error(
          `"${product.name}" ka stock kam hai. Available: ${product.stockQty}, Maanga gaya: ${item.quantity}`
        );
      }

      const lineTotal = item.quantity * item.rate * (1 + (item.gstPercent || 0) / 100);
      totalAmount += lineTotal;

      itemsWithCost.push({
        ...item,
        costPriceAtSale: product.purchasePrice,
      });

      // decrease stock -- negative stock never allowed (checked above)
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stockQty: -item.quantity } },
        { session }
      );
    }

    let paymentStatus = "unpaid";
    if (paymentType === "cash" || amountPaid >= totalAmount) {
      paymentStatus = "paid";
    } else if (amountPaid > 0) {
      paymentStatus = "partial";
    }

    const sale = await Sale.create(
      [
        {
          party,
          items: itemsWithCost,
          totalAmount,
          paymentType,
          paymentStatus,
          amountPaid: paymentType === "cash" ? totalAmount : amountPaid,
        },
      ],
      { session }
    );

    // update customer balance (udhaar) -- only the unpaid portion
    if (paymentType === "udhaar") {
      const unpaidAmount = totalAmount - amountPaid;
      await Party.findByIdAndUpdate(party, { $inc: { balance: unpaidAmount } }, { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, sale: sale[0] });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: err.message });
  }
}

async function listSales(req, res) {
  try {
    const filter = {};
    if (req.query.party) filter.party = req.query.party;
    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) filter.date.$gte = new Date(req.query.from);
      if (req.query.to) filter.date.$lte = new Date(req.query.to);
    }
    const sales = await Sale.find(filter).populate("party").populate("items.product").sort({ date: -1 });
    res.json({ success: true, sales });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { createSale, listSales };
