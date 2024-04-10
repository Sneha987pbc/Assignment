const express = require("express");

const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createProductReview,
  getProductReviews,
  deleteReview,
  getAdminProducts,
} = require("../controllers/productController");

const { restrictToLoggedinUserOnly, authorizeRoles } = require("../middleware/auth");


const router = express.Router();

router.route("/products").get(getAllProducts);

router
  .route("/admin/products")
  .get(restrictToLoggedinUserOnly("token"), authorizeRoles("admin"), getAdminProducts);

router
  .route("/admin/product/new")
  .post(restrictToLoggedinUserOnly("token"), authorizeRoles("admin"), createProduct);

router
  .route("/admin/product/:id")
  .put(restrictToLoggedinUserOnly("token"), authorizeRoles("admin"), updateProduct)
  .delete(restrictToLoggedinUserOnly("token"), authorizeRoles("admin"), deleteProduct);

router.route("/product/:id").get(getProductDetails);

router.route("/review/:productId").put(restrictToLoggedinUserOnly("token"), createProductReview);

router
  .route("/reviews")
  .get(getProductReviews)
  .delete(restrictToLoggedinUserOnly("token"), deleteReview);

module.exports = router;
