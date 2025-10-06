const express = require('express')
const router = express.Router()
const adminModel = require("../Models/adminModel")
const userModel = require("../Models/userModel")
const jwt = require("jsonwebtoken")

router.use(express.json())
router.use(express.urlencoded({ extended: true }))

// Combined Login for admin and User
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    // Check Admin first
    const admin = await adminModel.findOne({username})
    if (admin && admin.password === password) {
      const payload = { username: admin.username, adminId: admin._id, role: "admin" }
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' })
      return res.status(200).json({ message: "Admin login successful", token, role: "admin" }) // Returns 'token'
    }
    // Check User next
    const user = await userModel.findOne({ username })
    if (user && user.password === password) {
      const payload = { username: user.username, userId: user._id, role: "user" }
      const usertoken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' })

      return res.status(200).json({ message: "User login successful", usertoken, role: "user" })
    }
    // Authentication failed
    return res.status(401).json({ message: 'Invalid username or password' })

  } catch (err) {
    console.error("Login error:", err)
    res.status(500).json({ message: "Server error during login" })
  }
})

module.exports = router;