const Payment = require("../models/Payment");
const Party = require("../models/Party");

// POST /api/payments/receive  -- "Jama karo": customer paid us
async function receivePayment(req, res) {
  try {
    const {
      party,
      amount,
      note,
      relatedTransactionType,
      relatedTransactionId,
    } = req.body;

    const partyDoc = await Party.findOne({
      _id: party,
      ownerId: req.user.id,
      type: "customer",
    });
    if (!partyDoc)
      return res
        .status(404)
        .json({ success: false, message: "Party nahi mili." });
    if (!Number.isFinite(amount) || amount <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Amount valid hona chahiye." });

    const payment = await Payment.create({
      ownerId: req.user.id,
      party,
      amount,
      direction: "received",
      relatedTransactionType: relatedTransactionType || "none",
      relatedTransactionId: relatedTransactionId || null,
      note,
    });

    // customer's outstanding balance ghatta hai
    partyDoc.balance -= amount;
    await partyDoc.save();

    res
      .status(201)
      .json({ success: true, payment, newBalance: partyDoc.balance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/payments/pay  -- "Chuka do": we paid a supplier
async function makePayment(req, res) {
  try {
    const {
      party,
      amount,
      note,
      relatedTransactionType,
      relatedTransactionId,
    } = req.body;

    const partyDoc = await Party.findOne({
      _id: party,
      ownerId: req.user.id,
      type: "supplier",
    });
    if (!partyDoc)
      return res
        .status(404)
        .json({ success: false, message: "Party nahi mili." });
    if (!Number.isFinite(amount) || amount <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Amount valid hona chahiye." });

    const payment = await Payment.create({
      ownerId: req.user.id,
      party,
      amount,
      direction: "made",
      relatedTransactionType: relatedTransactionType || "none",
      relatedTransactionId: relatedTransactionId || null,
      note,
    });

    // supplier ko diya gaya, hamara payable ghatta hai
    partyDoc.balance -= amount;
    await partyDoc.save();

    res
      .status(201)
      .json({ success: true, payment, newBalance: partyDoc.balance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function listPayments(req, res) {
  try {
    const filter = { ownerId: req.user.id };
    if (req.query.party) filter.party = req.query.party;
    const payments = await Payment.find(filter)
      .populate({ path: "party", match: { ownerId: req.user.id } })
      .sort({ date: -1 });
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { receivePayment, makePayment, listPayments };
