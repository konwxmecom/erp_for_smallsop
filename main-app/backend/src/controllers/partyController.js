const Party = require("../models/Party");

async function createParty(req, res) {
  try {
    const party = await Party.create(req.body);
    res.status(201).json({ success: true, party });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function listParties(req, res) {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type; // ?type=customer or ?type=supplier
    const parties = await Party.find(filter).sort({ name: 1 });
    res.json({ success: true, parties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getParty(req, res) {
  try {
    const party = await Party.findById(req.params.id);
    if (!party) return res.status(404).json({ success: false, message: "Party nahi mili." });
    res.json({ success: true, party });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateParty(req, res) {
  try {
    const party = await Party.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!party) return res.status(404).json({ success: false, message: "Party nahi mili." });
    res.json({ success: true, party });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteParty(req, res) {
  try {
    await Party.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Party delete ho gayi." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// Outstanding udhaar summary -- sab parties ka current balance
async function outstandingSummary(req, res) {
  try {
    const customers = await Party.find({ type: "customer", balance: { $ne: 0 } }).sort({ balance: -1 });
    const suppliers = await Party.find({ type: "supplier", balance: { $ne: 0 } }).sort({ balance: -1 });

    const totalReceivable = customers.reduce((sum, p) => sum + p.balance, 0); // customers owe us
    const totalPayable = suppliers.reduce((sum, p) => sum + p.balance, 0); // we owe suppliers

    res.json({
      success: true,
      customers,
      suppliers,
      totalReceivable,
      totalPayable,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { createParty, listParties, getParty, updateParty, deleteParty, outstandingSummary };
