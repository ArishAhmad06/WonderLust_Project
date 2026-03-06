const express = require("express"); // require express
const app = express();
const users = require("./router/user.js"); //export hone ke baad require users
const posts = require("./router/post.js");
// const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash"); // require flash from packages
const path = require("path");

const sessionOptions = {
  secret: "mysupersecretstring",
  resave: false,
  saveUninitialized: true,
};
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(session(sessionOptions));
app.use(flash());

//middleware for flash msg
app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  next();
});

app.get("/register", (req, res) => {
  let { name = "anonymous" } = req.query; // to get name from query
  req.session.name = name; // name is stored in name var
  if (name == "anonymous") {
    req.flash("error", "user not registered");
  } else {
    req.flash("success", "user registered successfully!");
  }
  res.redirect("/hello");
});

app.get("/hello", (req, res) => {
  res.render("page.ejs", {
    name: req.session.name,
  }); // name render to ejs template
});

// app.get("/test", (req, res) => {
//   res.send("test successful!");
// });
// app.get("/reqcount", (req, res) => {
//   if (req.session.count) {
//     req.session.count++;
//   } else {
//     req.session.count = 1;
//   }
//   res.send(`The total count is ${req.session.count} times`);
// });

// app.use(cookieParser("secretcode"));

////signed cookies
// app.get("/getsignedcookie", (req, res) => {
//   res.cookie("made-in", "India", { signed: true });
//   res.send("signed cookie sent!");
// });

// app.get("/verify", (req, res) => {
//   console.log(req.signedCookies);
//   res.send("verfied");
// });

// app.get("/getcookies", (req, res) => {
//   res.cookie("greet", "Hello");
//   res.cookie("madeIn", "IND");
//   res.send("sent you some cookies!");
// });

// app.get("/greet", (req, res) => {
//   let { name = "anonymous" } = req.cookies;
//   res.send(`Hii, ${name}`);
// });

// app.get("/", (req, res) => {
//   console.dir(req.cookies);
//   res.send("Hii, I am root!");
// });

// //users and posts
// app.use("/users", users); // jab users me req jayegi to wo users se match krega
// app.use("/posts", posts);

app.listen(3000, () => {
  console.log("server listning port on 3000");
});
