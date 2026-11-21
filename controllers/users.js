const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  try {
    let { username, password, email } = req.body;
    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash(
        "success",
        `Hello ${registeredUser.username.toUpperCase()}, Welcome to ZyloStays!`,
      );
      return res.redirect("/listings"); // ← add return
    });
  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = (req, res, next) => {
    req.flash(
        "success",
        `Welcome back, ${req.user.username.toUpperCase()}!`
    );

    const redirectUrl = res.locals.redirectUrl || "/listings";

    req.session.save((err) => {
        if (err) {
            return next(err);
        }

        res.redirect(redirectUrl);
    });
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You Logged out successfully !");
    return res.redirect("/listings");
  });
};
