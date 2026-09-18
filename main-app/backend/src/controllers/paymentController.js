const Payment = require("../models/Payment");
const Party = require("../models/Party");

// POST /api/payments/receive  -- "Jama karo": customer paid us
async function receivePayment(req, res) {
  try {
    const { party, amount, note, relatedTransactionType, relatedTransactionId } = req.body;

    const partyDoc = await Party.findById(party);
    if (!partyDoc) return res.status(404).json({ success: false, message: "Party nahi mili." });

    const payment = await Payment.create({
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

    res.status(201).json({ success: true, payment, newBalance: partyDoc.balance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/payments/pay  -- "Chuka do": we paid a supplier
async function makePayment(req, res) {
  try {
    const { party, amount, note, relatedTransactionType, relatedTransactionId } = req.body;

    const partyDoc = await Party.findById(party);
    if (!partyDoc) return res.status(404).json({ success: false, message: "Party nahi mili." });

    const payment = await Payment.create({
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

    res.status(201).json({ success: true, payment, newBalance: partyDoc.balance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function listPayments(req, res) {
  try {
    const filter = {};
    if (req.query.party) filter.party = req.query.party;
    const payments = await Payment.find(filter).populate("party").sort({ date: -1 });
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { receivePayment, makePayment, listPayments };
