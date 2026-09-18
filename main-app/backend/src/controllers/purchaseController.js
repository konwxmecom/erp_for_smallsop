const mongoose = require("mongoose");
const Purchase = require("../models/Purchase");
const Product = require("../models/Product");
const Party = require("../models/Party");

// POST /api/purchases
// Body: { party, items: [{product, quantity, rate, gstPercent}], paymentType, amountPaid }
async function createPurchase(req, res) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { party, items, paymentType, amountPaid = 0 } = req.body;

    if (!items || !items.length) {
      throw new Error("Kam se kam ek product add karein.");
    }

    let totalAmount = 0;
    for (const item of items) {
      const lineTotal = item.quantity * item.rate * (1 + (item.gstPercent || 0) / 100);
      totalAmount += lineTotal;

      // increase stock
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stockQty: item.quantity } },
        { session }
      );
    }

    let paymentStatus = "unpaid";
    if (paymentType === "cash" || amountPaid >= totalAmount) {
      paymentStatus = "paid";
    } else if (amountPaid > 0) {
      paymentStatus = "partial";
    }

    const purchase = await Purchase.create(
      [
        {
          party,
          items,
          totalAmount,
          paymentType,
          paymentStatus,
          amountPaid: paymentType === "cash" ? totalAmount : amountPaid,
        },
      ],
      { session }
    );

    // update supplier balance (udhaar) -- only the unpaid portion
    if (paymentType === "udhaar") {
      const unpaidAmount = totalAmount - amountPaid;
      await Party.findByIdAndUpdate(party, { $inc: { balance: unpaidAmount } }, { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, purchase: purchase[0] });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: err.message });
  }
}

async function listPurchases(req, res) {
  try {
    const filter = {};
    if (req.query.party) filter.party = req.query.party;
    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) filter.date.$gte = new Date(req.query.from);
      if (req.query.to) filter.date.$lte = new Date(req.query.to);
    }
    const purchases = await Purchase.find(filter)
      .populate("party")
      .populate("items.product")
      .sort({ date: -1 });
    res.json({ success: true, purchases });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { createPurchase, listPurchases };
