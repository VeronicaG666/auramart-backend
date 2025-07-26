const pool = require("../config");
const productService = require("../services/product.service");

const getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, search = "", category = "", sort = "" } = req.query;

    const { products, totalResults, totalPages } = await productService.getAllProducts({
      page: Number(page),
      search,
      category,
      sort,
    });

    res.status(200).json({
      products,
      totalResults,
      totalPages,
      currentPage: Number(page),
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const newProduct = await productService.addProduct(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    console.log("✅ Fetching product with ID:", req.params.id);

    const product = await productService.getProductById(req.params.id);

    console.log("✅ Query Result:", product);

    if (!product) {
      console.warn("⚠️ No product found for ID:", req.params.id);
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("❌ Error in getProduct:", error.message);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


const getProductBySlug = async (req, res, next) => {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

const getProductByName = async (req, res, next) => {
  try {
    const product = await productService.getProductByName(req.params.name);
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedProduct = await productService.updateProduct({ ...req.body, id });
    res.status(200).json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedProduct = await productService.removeProduct(id);
    res.status(200).json({ message: "Product deleted", deletedProduct });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await productService.getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

const getProductReviews = async (req, res) => {
  const { product_id, user_id } = req.query;
  try {
    const reviewExist = await pool.query(
      "SELECT EXISTS (SELECT * FROM reviews WHERE product_id = $1 AND user_id = $2)",
      [product_id, user_id]
    );

    const reviews = await pool.query(
      `SELECT users.fullname AS name, reviews.* FROM reviews
       JOIN users ON users.user_id = reviews.user_id
       WHERE product_id = $1`,
      [product_id]
    );

    res.status(200).json({
      reviewExist: reviewExist.rows[0].exists,
      reviews: reviews.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Error fetching reviews" });
  }
};

const createProductReview = async (req, res) => {
  const { product_id, content, rating } = req.body;
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      `INSERT INTO reviews(user_id, product_id, content, rating)
       VALUES($1, $2, $3, $4) RETURNING *`,
      [user_id, product_id, content, rating]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message || "Error creating review" });
  }
};

const updateProductReview = async (req, res) => {
  const { content, rating, id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE reviews SET content = $1, rating = $2 WHERE id = $3 RETURNING *`,
      [content, rating, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message || "Error updating review" });
  }
};

module.exports = {
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductByName,
  getProductBySlug,
  getCategories,
  getProductReviews,
  updateProductReview,
  createProductReview,
};
