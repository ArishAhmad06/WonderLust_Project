const express = require("express");
const router = express.Router(); // create new router object from express router
// Index-posts
router.get("/", (req, res) => {
  res.send("Get for posts");
});

// Show-posts
router.get("/:id", (req, res) => {
  res.send("Get for posts Id");
});

// Post-posts
router.post("/", (req, res) => {
  res.send("post for posts");
});

//Delete-posts
router.delete("/:id", (req, res) => {
  res.send("delete for posts");
});

module.exports = router;
