const pool = require("../db");


const getAllProductsDb = async ({ limit, offset, search, category, sort }) => {
  let baseQuery = "SELECT * FROM products WHERE 1=1";
  let countQuery = "SELECT COUNT(*) FROM products WHERE 1=1";

  const params = [];
  const countParams = [];
  let paramIndex = 1;

  if (search) {
    baseQuery += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
    countQuery += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    countParams.push(`%${search}%`);
    paramIndex++;
  }

  if (category) {
    baseQuery += ` AND category = $${paramIndex}`;
    countQuery += ` AND category = $${paramIndex}`;
    params.push(category);
    countParams.push(category);
    paramIndex++;
  }

  if (sort === "price_asc") {
    baseQuery += " ORDER BY price ASC";
  } else if (sort === "price_desc") {
    baseQuery += " ORDER BY price DESC";
  } else {
    baseQuery += " ORDER BY id";
  }

  baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await pool.query(baseQuery, params);
  const countResult = await pool.query(countQuery, countParams);

  return {
    rows: result.rows,
    total: Number(countResult.rows[0].count),
  };
};


const getAllCategoriesDb = async () => {
  const result = await pool.query("SELECT DISTINCT category FROM products ORDER BY category ASC");
  return result.rows.map((row) => row.category);
};


const createProductDb = async (data) => {
  const { name, description, price, image_url, stock, category } = data;
  const result = await pool.query(
    `INSERT INTO products (name, description, price, image_url, stock, category)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, description, price, image_url, stock, category]
  );
  return result.rows[0];
};


const getProductDb = async (id) => {
  const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
  return result.rows[0];
};


const getProductBySlugDb = async (slug) => {
  const result = await pool.query("SELECT * FROM products WHERE slug = $1", [slug]);
  return result.rows[0];
};


const getProductByNameDb = async (name) => {
  const result = await pool.query("SELECT * FROM products WHERE name ILIKE $1", [`%${name}%`]);
  return result.rows;
};


const updateProductDb = async (data) => {
  const { id, name, description, price, image_url, stock, category } = data;
  const result = await pool.query(
    `UPDATE products
     SET name = $1, description = $2, price = $3, image_url = $4, stock = $5, category = $6
     WHERE id = $7
     RETURNING *`,
    [name, description, price, image_url, stock, category, id]
  );
  return result.rows[0];
};


const deleteProductDb = async (id) => {
  const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);
  return result.rows[0];
};

module.exports = {
  getAllProductsDb,
  getAllCategoriesDb,
  createProductDb,
  getProductDb,
  updateProductDb,
  deleteProductDb,
  getProductByNameDb,
  getProductBySlugDb,
};
