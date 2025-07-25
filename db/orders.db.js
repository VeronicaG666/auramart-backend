const pool = require("../config/index");

const createOrderDb = async ({ cartId, amount, userId, ref, paymentMethod }) => {
  const { rows: order } = await pool.query(
    "INSERT INTO orders(user_id, status, total, created_at) VALUES($1, 'complete', $2, NOW()) RETURNING *",
    [userId, amount]
  );

  await pool.query(
    `
      INSERT INTO order_items(order_id, product_id, quantity) 
      SELECT $1, product_id, quantity FROM cart_items WHERE cart_id = $2
    `,
    [order[0].id, cartId]
  );

  return order[0];
};

const getAllOrdersDb = async ({ userId, limit, offset }) => {
  const { rowCount } = await pool.query(
    "SELECT * FROM orders WHERE user_id = $1",
    [userId]
  );

  const orders = await pool.query(
    `SELECT id, user_id, status, created_at::date AS date, total
     FROM orders WHERE user_id = $1 ORDER BY id DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return { items: orders.rows, total: rowCount };
};

const getOrderDb = async ({ id, userId }) => {
  const { rows: order } = await pool.query(
    `
      SELECT products.*, order_items.quantity
      FROM orders
      JOIN order_items ON order_items.order_id = orders.id
      JOIN products ON products.id = order_items.product_id
      WHERE orders.id = $1 AND orders.user_id = $2
    `,
    [id, userId]
  );

  return order;
};

module.exports = {
  createOrderDb,
  getAllOrdersDb,
  getOrderDb,
};
