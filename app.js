// if (process.env.NODE_ENV !== "production") {
//   require("dotenv").config();
// }
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// MONGO DB CONNECTION
const dbUrl = process.env.ATLASDB_URL || process.env.MONGO_URL;

const sessionSecret = process.env.SECRET;

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  // crypto: {
  //   secret: sessionSecret,
  // },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.error("Session store error:", err);
});

const sessionOptions = {
  store,
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// CONNECT-SESSION
app.use(session(sessionOptions));
app.use(flash());

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// FLASH MIDDLEWARE
app.use((req, res, next) => {
    console.log("Authenticated user:", req.user?.username || "Not logged in");

    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;

    next();
});

app.get("/", (req, res) => res.redirect("/listings"));
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  if (statusCode >= 500) console.error(err);
  res.status(statusCode).render("error.ejs", { message });
});

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`listening to the port ${port}`);
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});