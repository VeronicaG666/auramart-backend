const {
  createOrderDb,
  getAllOrdersDb,
  getOrderDb,
} = require("../db/orders.db");
const { ErrorHandler } = require("../helpers/error");
const pool = require("../config/index");

class OrderService {
  createOrder = async ({ cartId, userId }) => {
    try {
      const cartItemsResult = await pool.query(
        `SELECT ci.product_id, ci.quantity, p.price
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         WHERE ci.cart_id = $1`,
        [cartId]
      );

      const cartItems = cartItemsResult.rows;
      if (!cartItems.length) throw new ErrorHandler(400, "Cart is empty");

      const totalPrice = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const { rows: [order] } = await pool.query(
        `INSERT INTO orders(user_id, total, status, created_at)
         VALUES($1, $2, 'complete', NOW())
         RETURNING id, user_id, total, status, created_at`,
        [userId, totalPrice]
      );

      await pool.query(
        `INSERT INTO order_items(order_id, product_id, quantity)
         SELECT $1, product_id, quantity FROM cart_items WHERE cart_id = $2`,
        [order.id, cartId]
      );

      await pool.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cartId]);

      return order;
    } catch (error) {
      console.error(" Order creation error:", error.message);
      throw new ErrorHandler(500, "Failed to create order");
    }
  };

  getAllOrders = async (userId, page) => {
    const limit = 5;
    const offset = (page - 1) * limit;
    try {
      return await getAllOrdersDb({ userId, limit, offset });
    } catch (error) {
      throw new ErrorHandler(500, "Failed to fetch orders");
    }
  };

  
  getOrderById = async ({ id, userId }) => {
    try {
      const order = await getOrderDb({ id, userId });
      if (!order || order.length === 0) {
        throw new ErrorHandler(404, "Order does not exist");
      }
      return order;
    } catch (error) {
      throw new ErrorHandler(500, "Failed to fetch order details");
    }
  };
}

module.exports = new OrderService();
