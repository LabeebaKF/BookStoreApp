const express = require('express')
const router = express.Router()
const adminModel = require("../Models/adminModel")
const jwt = require("jsonwebtoken")

router.use(express.json())
router.use(express.urlencoded({ extended: true }))

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    console.log('Admin login attempt:', { username, password: password ? 'provided' : 'missing' })
    // Check only for admin
    const admin = await adminModel.findOne({ username })
    console.log('Admin found:', admin ? 'yes' : 'no')

    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = admin.password === password;
    console.log('Password match:', isMatch)

    if (isMatch) {
      const token = jwt.sign({ username: admin.username, id: admin._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: '2h' })
      return res.status(200).send({ message: "Admin login successful", token, role: "admin" })
    }

    //If no admin is found or password doesn't match
    return res.status(401).json({ message: "Invalid credentials" })

  } catch (err) {
    console.error("Admin login error:", err)
    res.status(500).send({ message: "Server error" })
  }
})

module.exports = router;