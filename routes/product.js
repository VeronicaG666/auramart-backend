const router = require("express").Router();
const {
  getAllProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductBySlug,
  getCategories,
  getProductReviews,
  createProductReview,
  updateProductReview,
} = require("../controllers/products.controller");

const verifyAdmin = require("../middleware/verifyAdmin");
const verifyToken = require("../middleware/verifyToken");

// ✅ All Products & Create
router.route("/")
  .get(getAllProducts)
  .post(verifyToken, verifyAdmin, createProduct);

// ✅ Categories
router.get("/categories/list", getCategories);

// ✅ Get Product by ID (For guest cart & direct lookup)
router.get("/id/:id", getProduct);  // <-- NEW

// ✅ Slug-based routes
router.route("/:slug")
  .get(getProductBySlug)
  .put(verifyToken, verifyAdmin, updateProduct)
  .delete(verifyToken, verifyAdmin, deleteProduct);

// ✅ Reviews
router.route("/:id/reviews")
  .get(getProductReviews)
  .post(verifyToken, createProductReview)
  .put(verifyToken, updateProductReview);

module.exports = router;
