const express = require("express");
const checkAuth = require("../middleware/checkAuth");
const {
  createParty,
  listParties,
  getParty,
  updateParty,
  deleteParty,
  outstandingSummary,
} = require("../controllers/partyController");

const router = express.Router();

router.use(checkAuth);
router.post("/", createParty);
router.get("/", listParties);
router.get("/outstanding-summary", outstandingSummary);
router.get("/:id", getParty);
router.put("/:id", updateParty);
router.delete("/:id", deleteParty);

module.exports = router;
