const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Author = require("../Models/authorModel");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, phoneno, address, password, confirmpassword } = req.body;

    if (password !== confirmpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const exists = await Author.findOne({ username });
    if (exists) {
      return res.status(400).json({ message: "Author already exists" });
    }

    const author = await Author.create({
      username, phoneno, address, password
    });

    res.status(201).json({ message: "Author registration successful" });
  } catch (err) {
    console.error("Author Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const author = await Author.findOne({ username });
    if (!author) return res.status(400).json({ message: "Invalid credentials" });

    if (author.password !== password) {
  return res.status(400).json({ message: "Invalid credentials" });
}

    const authortoken = jwt.sign(
      { id: author._id, role: "author", username: author.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      authortoken,
      author: {
        id: author._id,
        username: author.username,
        phoneno: author.phoneno,
        address: author.address,
      }
    });
  } catch (err) {
    console.error("Author Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
