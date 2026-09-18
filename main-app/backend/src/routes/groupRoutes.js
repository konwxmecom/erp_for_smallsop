const express = require("express");
const checkAuth = require("../middleware/checkAuth");
const { createGroup, listGroups, updateGroup, deleteGroup } = require("../controllers/groupController");

const router = express.Router();

router.use(checkAuth);
router.post("/", createGroup);
router.get("/", listGroups);
router.put("/:id", updateGroup);
router.delete("/:id", deleteGroup);

module.exports = router;
