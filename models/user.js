const mongoose = require("mongoose"); // Importing/Requiring mongoose from package.
const Schema = mongoose.Schema;
const passportLocalMongoose =
  require("passport-local-mongoose").default ||
  require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});

userSchema.plugin(passportLocalMongoose); //for usrname and salted password
module.exports = mongoose.model("User", userSchema);
