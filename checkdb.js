require("dotenv").config({ quiet: true });
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");

const url = process.env.MONGO_URL || "";
console.log("MONGO_URL found:", Boolean(url));

try {
  const u = new URL(url);
  console.log("scheme  :", u.protocol);
  console.log("username:", decodeURIComponent(u.username));
  console.log("pwd len :", decodeURIComponent(u.password).length);
  console.log("host    :", u.hostname);
  console.log("db name :", u.pathname || "(none)");
  if (/YOUR_|REAL_|[<>]/.test(url)) console.log("!! placeholder text is still in the string");
} catch (e) {
  console.log("!! string is not a valid URL (a special character in the password is the usual cause)");
}

mongoose
  .connect(url, { serverSelectionTimeoutMS: 8000 })
  .then(() => console.log("CONNECTED OK"))
  .catch((e) => console.log("FAILED:", e.message))
  .finally(() => mongoose.disconnect());