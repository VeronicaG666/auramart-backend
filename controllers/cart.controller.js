const cartService = require("../services/cart.service");

const getCart = async (req, res) => {
  const userId = req.user.id;
  const cart = await cartService.getCart(userId);
  res.json({ items: cart });
};

const addItem = async (req, res) => {
  console.log(" Incoming add-to-cart body:", req.body);
  console.log(" Auth user:", req.user);

  const { product_id, quantity } = req.body;
  const userId = req.user.id;

  if (!product_id || !quantity || quantity <= 0) {
    return res.status(400).json({ message: "Invalid product_id or quantity" });
  }

  const cart = await cartService.addItem(userId, product_id, quantity);
  res.status(200).json({ items: cart });
};

const deleteItem = async (req, res) => {
  const { product_id } = req.body;
  const userId = req.user.id;

  const data = await cartService.removeItem(userId, product_id);
  res.status(200).json({ items: data });
};

const increaseItemQuantity = async (req, res) => {
  const { product_id } = req.body;
  const userId = req.user.id;

  const cart = await cartService.increment(userId, product_id);
  res.json({ items: cart });
};

const decreaseItemQuantity = async (req, res) => {
  const { product_id } = req.body;
  const userId = req.user.id;

  const cart = await cartService.decrement(userId, product_id);
  res.json({ items: cart });
};

module.exports = {
  getCart,
  addItem,
  increaseItemQuantity,
  decreaseItemQuantity,
  deleteItem,
};
