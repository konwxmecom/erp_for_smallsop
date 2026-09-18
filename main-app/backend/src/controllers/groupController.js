const Group = require("../models/Group");

async function createGroup(req, res) {
  try {
    const { name, localName } = req.body;
    const group = await Group.create({ name, localName });
    res.status(201).json({ success: true, group });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function listGroups(req, res) {
  try {
    const groups = await Group.find().sort({ name: 1 });
    res.json({ success: true, groups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateGroup(req, res) {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!group) return res.status(404).json({ success: false, message: "Group nahi mila." });
    res.json({ success: true, group });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteGroup(req, res) {
  try {
    await Group.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Group delete ho gaya." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { createGroup, listGroups, updateGroup, deleteGroup };
