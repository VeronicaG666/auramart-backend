const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const {
  getOrder,
  getAllOrders,
  createOrder,
} = require("../controllers/orders.controller");

router.post("/create", verifyToken, createOrder);

router.get("/", verifyToken, getAllOrders);

router.get("/:id", verifyToken, getOrder);

module.exports = router;
