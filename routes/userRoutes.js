const express = require("express");

const {
  handleSignup,
  handleSignin,
  logout,
  getUserDetails,
  forgotPassword,
  resetPassword,
  updatePassword,
  getAllUser,
  getSingleUser,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");

const {  checkForAuthenticationCookie,
  restrictToLoggedinUserOnly,
  authorizeRoles} = require("../middleware/auth")

const router = express.Router();

router.route("/register").post(handleSignup);

router.route("/login").post(checkForAuthenticationCookie("token"), handleSignin);

router.route("/password/forgot").post(restrictToLoggedinUserOnly("token"),forgotPassword);

router
  .route("/password/reset/:token")
  .put(restrictToLoggedinUserOnly("token"), resetPassword);

router.route("/logout").get(logout);

router.route("/me").get(restrictToLoggedinUserOnly("token"), getUserDetails);

router.route("/password/update").put(restrictToLoggedinUserOnly("token"), updatePassword);


router
  .route("/admin/users")
  .get(restrictToLoggedinUserOnly("token"), authorizeRoles("admin"), getAllUser);

router
  .route("/admin/user/:id")
  .get (restrictToLoggedinUserOnly("token"), authorizeRoles("admin"), getSingleUser)
  .put(restrictToLoggedinUserOnly("token"), authorizeRoles("admin"), updateUserRole)
  .delete(restrictToLoggedinUserOnly("token"), authorizeRoles("admin"), deleteUser);

module.exports = router;