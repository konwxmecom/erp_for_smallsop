const Group = require("../models/Group");

async function createGroup(req, res) {
  try {
    const { name, localName } = req.body;
    const group = await Group.create({ ownerId: req.user.id, name, localName });
    res.status(201).json({ success: true, group });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function listGroups(req, res) {
  try {
    const groups = await Group.find({ ownerId: req.user.id }).sort({ name: 1 });
    res.json({ success: true, groups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateGroup(req, res) {
  try {
    const { name, localName } = req.body;
    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.id },
      { $set: { name, localName } },
      {
        new: true,
        runValidators: true,
      },
    );
    if (!group)
      return res
        .status(404)
        .json({ success: false, message: "Group nahi mila." });
    res.json({ success: true, group });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteGroup(req, res) {
  try {
    await Group.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
    res.json({ success: true, message: "Group delete ho gaya." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
module.exports = { createGroup, listGroups, updateGroup, deleteGroup };
