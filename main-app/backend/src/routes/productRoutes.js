const express = require("express");
const checkAuth = require("../middleware/checkAuth");
const {
  createProduct,
  listProducts,
  getLowStockProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

router.use(checkAuth);
router.post("/", createProduct);
router.get("/", listProducts);
router.get("/low-stock", getLowStockProducts);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
