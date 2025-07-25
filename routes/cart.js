const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const {
  getCart,
  addItem,
  deleteItem,
  increaseItemQuantity,
  decreaseItemQuantity,
} = require("../controllers/cart.controller");

router.use(verifyToken);

router.get("/", getCart);

router.post("/add", addItem);

router.delete("/delete", deleteItem);

router.put("/increment", increaseItemQuantity);

router.put("/decrement", decreaseItemQuantity);

module.exports = router;
