// const express = require('express');
// const router = express.Router();
// const Razorpay = require('razorpay');
// const crypto = require('crypto');
// const { verifyToken } = require('../middleware/auth');
// const Order = require('../Models/orderModel');
// const Book = require('../Models/bookModel');
// const User = require('../Models/userModel');

// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// // CREATE ORDER
// router.post('/create-order', verifyToken, async (req, res) => {
//     try {
//         const { amount, currency = 'INR' } = req.body;
//         const options = { amount: amount * 100, currency, receipt: `receipt_${Date.now()}` };
//         const order = await razorpay.orders.create(options);
//         res.status(200).json(order);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Error creating order', err });
//     }
// });

// //verify payment and place order
// router.post('/verify-payment', verifyToken, async (req, res) => {
//     try {
//         const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, totalAmount, address, phone } = req.body;

//         const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//             .update(razorpay_order_id + "|" + razorpay_payment_id)
//             .digest('hex');

//         if (expectedSignature !== razorpay_signature)
//             return res.status(400).json({ success: false, message: 'Invalid signature' });

//         const user = await User.findById(req.userId);
//         if (!user) return res.status(404).json({ message: 'User not found' });

//         const bulkOps = items.map(item => ({
//             updateOne: { filter: { _id: item.bookId }, update: { $inc: { stock: -item.quantity } } }
//         }));
//         await Book.bulkWrite(bulkOps);

//         const newOrder = new Order({
//             userId: req.userId,
//             userName: user.username,
//             items,
//             totalAmount,
//             address,
//             phone,
//             paymentMethod: 'Online',
//             status: 'Paid'
//         });
//         await newOrder.save();

//         res.status(200).json({ success: true, message: 'Payment verified & order placed', orderId: newOrder._id });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Error verifying payment' });
//     }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { verifyToken } = require("../middleware/auth");
const Order = require("../Models/orderModel");
const Book = require("../Models/bookModel");
const User = require("../Models/userModel");

require("dotenv").config();

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
router.post("/create-order", verifyToken, async (req, res) => {
  try {
    console.log("Hit /api/payment/create-order");
    const { amount, currency = "INR" } = req.body;

    if (!amount) return res.status(400).json({ message: "Amount required" });

    const options = {
      amount: amount * 100, // amount in paise
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    console.log("🧾 Razorpay Order Created:", order.id);
    res.status(200).json(order);
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ message: "Error creating order", error: err.message });
  }
});

//  Verify Razorpay payment
router.post("/verify-payment", verifyToken, async (req, res) => {
  try {
    console.log(" Hit /api/payment/verify-payment");

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      totalAmount,
      address,
      phone,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment details" });
    }

    // Signature verification
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.log("Invalid signature received");
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // Get user
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Reduce stock for purchased books
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item.bookId },
        update: { $inc: { stock: -item.quantity } },
      },
    }));
    await Book.bulkWrite(bulkOps);

    // Create new order
    const newOrder = new Order({
      userId: req.userId,
      userName: user.username,
      items,
      totalAmount,
      address,
      phone,
      paymentMethod: "Online",
      status: "Paid",
    });

    await newOrder.save();

    console.log("Payment verified, order placed:", newOrder._id);
    res.status(200).json({
      success: true,
      message: "Payment verified & order placed successfully",
      orderId: newOrder._id,
    });
  } catch (err) {
    console.error("Error verifying payment:", err);
    res.status(500).json({ message: "Error verifying payment", error: err.message });
  }
});

module.exports = router;
