const express = require("express");
const {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");
const router = express.Router();

const { restrictToLoggedinUserOnly, authorizeRoles } = require("../middleware/auth");

router.route("/order/new").post(restrictToLoggedinUserOnly("token"), newOrder);

router.route("/order/:id").get(restrictToLoggedinUserOnly("token"), getSingleOrder);

router.route("/orders/me").get(restrictToLoggedinUserOnly("token"), myOrders);

router
  .route("/admin/orders")
  .get(restrictToLoggedinUserOnly("token"), authorizeRoles("admin"), getAllOrders);

router
  .route("/admin/order/:id")
  .put(restrictToLoggedinUserOnly("token"), authorizeRoles("admin"), updateOrder)
  .delete(restrictToLoggedinUserOnly("token"), authorizeRoles("admin"), deleteOrder);

module.exports = router;
