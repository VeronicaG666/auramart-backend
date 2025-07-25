const pool = require("../config/index");

class CartService {
  async getCart(userId) {
    const { rows } = await pool.query(
      `
      SELECT c.id AS cart_id, ci.product_id, ci.quantity, p.name, p.price, p.image_url,
      (ci.quantity * p.price) AS subtotal
      FROM cart c
      LEFT JOIN cart_items ci ON ci.cart_id = c.id
      LEFT JOIN products p ON ci.product_id = p.id
      WHERE c.user_id = $1
      ORDER BY ci.id ASC; 
      `,
      [userId]
    );
    return rows;
  }

  async addItem(userId, productId, quantity) {
    console.log("🔥 Backend received:", { userId, productId, quantity });

    quantity = parseInt(quantity, 10);

    if (isNaN(quantity) || quantity <= 0) {
      throw new Error("Invalid quantity");
    }

    let cart = await pool.query(`SELECT id FROM cart WHERE user_id = $1`, [userId]);

    if (cart.rows.length === 0) {
      const newCart = await pool.query(
        `INSERT INTO cart(user_id) VALUES($1) RETURNING id`,
        [userId]
      );
      cart = newCart;
    }

    const cartId = cart.rows[0].id;

    const productCheck = await pool.query(`SELECT id FROM products WHERE id = $1`, [productId]);
    if (productCheck.rows.length === 0) {
      throw new Error("Product does not exist");
    }

    const existingItem = await pool.query(
      `SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
      [cartId, productId]
    );

    if (existingItem.rows.length > 0) {
      await pool.query(
        `UPDATE cart_items SET quantity = quantity + $1 WHERE cart_id = $2 AND product_id = $3`,
        [quantity, cartId, productId]
      );
    } else {
      await pool.query(
        `INSERT INTO cart_items(cart_id, product_id, quantity) VALUES($1, $2, $3)`,
        [cartId, productId, quantity]
      );
    }

    return this.getCart(userId);
  }

  async removeItem(userId, productId) {
    const cart = await pool.query(`SELECT id FROM cart WHERE user_id = $1`, [userId]);
    if (cart.rows.length === 0) return [];

    await pool.query(
      `DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
      [cart.rows[0].id, productId]
    );

    return this.getCart(userId);
  }

  async increment(userId, productId) {
    const cart = await pool.query(`SELECT id FROM cart WHERE user_id = $1`, [userId]);
    if (cart.rows.length === 0) throw new Error("Cart not found");

    await pool.query(
      `UPDATE cart_items SET quantity = quantity + 1 WHERE cart_id = $1 AND product_id = $2`,
      [cart.rows[0].id, productId]
    );
    return this.getCart(userId);
  }

  async decrement(userId, productId) {
    const cart = await pool.query(`SELECT id FROM cart WHERE user_id = $1`, [userId]);
    if (cart.rows.length === 0) throw new Error("Cart not found");

    await pool.query(
      `UPDATE cart_items SET quantity = GREATEST(quantity - 1, 1) WHERE cart_id = $1 AND product_id = $2`,
      [cart.rows[0].id, productId]
    );
    return this.getCart(userId);
  }
}

module.exports = new CartService();
