const {
  getAllProductsDb,
  createProductDb,
  getProductDb,
  updateProductDb,
  deleteProductDb,
  getProductByNameDb,
  getProductBySlugDb,
  getAllCategoriesDb,
} = require("../db/product.db");
const { ErrorHandler } = require("../helpers/error");

class ProductService {
  getAllProducts = async ({ page, search, category, sort }) => {
    const limit = 12;
    const offset = (page - 1) * limit;

    try {
      const { rows, total } = await getAllProductsDb({
        limit,
        offset,
        search,
        category,
        sort,
      });

      return {
        products: rows,
        totalResults: total,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new ErrorHandler(error.statusCode || 500, error.message || "Error fetching products");
    }
  };

  addProduct = async (data) => {
    try {
      return await createProductDb(data);
    } catch (error) {
      throw new ErrorHandler(error.statusCode || 500, error.message || "Error adding product");
    }
  };


  getProductById = async (id) => {
    console.log("✅ Running query for product_id:", id);
    const result = await pool.query("SELECT * FROM products WHERE product_id = $1", [id]);
    console.log("✅ DB Response:", result.rows);
    return result.rows[0];
  };



  getProductBySlug = async (slug) => {
    try {
      const product = await getProductBySlugDb(slug);
      if (!product) throw new ErrorHandler(404, "Product not found");
      return product;
    } catch (error) {
      throw new ErrorHandler(error.statusCode || 500, error.message || "Error fetching product");
    }
  };


  getProductByName = async (name) => {
    try {
      const product = await getProductByNameDb(name);
      if (!product || product.length === 0) throw new ErrorHandler(404, "Product not found");
      return product;
    } catch (error) {
      throw new ErrorHandler(error.statusCode || 500, error.message || "Error fetching product");
    }
  };


  updateProduct = async (data) => {
    try {
      const product = await getProductDb(data.id);
      if (!product) throw new ErrorHandler(404, "Product not found");
      return await updateProductDb(data);
    } catch (error) {
      throw new ErrorHandler(error.statusCode || 500, error.message || "Error updating product");
    }
  };


  removeProduct = async (id) => {
    try {
      const product = await getProductDb(id);
      if (!product) throw new ErrorHandler(404, "Product not found");
      return await deleteProductDb(id);
    } catch (error) {
      throw new ErrorHandler(error.statusCode || 500, error.message || "Error deleting product");
    }
  };

  getAllCategories = async () => {
    try {
      return await getAllCategoriesDb();
    } catch (error) {
      throw new ErrorHandler(error.statusCode || 500, "Error fetching categories");
    }
  };
}

module.exports = new ProductService();
