const express = require("express");
const router = express.Router({});
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

router
  .route("/signup")
  .get(userController.renderSingupForm)
  .post(wrapAsync(userController.signup));

router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login,
  );
//logout user Route
router.get("/logout", userController.logout);

module.exports = router;

// //old code
// // form for signup
// router.get("/signup", userController.renderSingupForm);
// //post req for signup
// router.post("/signup", wrapAsync(userController.signup));

// //fom for login
// router.get("/login", userController.renderLoginForm);

// router.post(
//   "/login",
//   saveRedirectUrl,
//   passport.authenticate("local", {
//     failureRedirect: "/login",
//     failureFlash: true,
//   }),
//   userController.login,
// );
// //logout user Route
// router.get("/logout", userController.logout);

// module.exports = router;
