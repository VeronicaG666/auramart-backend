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


router.route("/")
  .get(getAllProducts)
  .post(verifyToken, verifyAdmin, createProduct); 

router.get("/categories/list", getCategories);

router.route("/:slug")
  .get(getProductBySlug) 
  .put(verifyToken, verifyAdmin, updateProduct) 
  .delete(verifyToken, verifyAdmin, deleteProduct);


router.route("/:id/reviews")
  .get(getProductReviews) 
  .post(verifyToken, createProductReview) 
  .put(verifyToken, updateProductReview); 

module.exports = router;
