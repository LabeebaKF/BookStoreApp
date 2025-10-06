const express = require('express');
const router = express.Router();
const Book = require('../Models/bookModel');
const User = require('../Models/userModel');
const Order = require('../Models/orderModel');
const Submission = require('../Models/submissionModel');

const { verifyToken,authAdmin } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

//admin dashboard
router.get("/dashboard/stats", async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const activeUsers = await User.countDocuments({ isBlocked: false });
    const pendingOrders = await Order.countDocuments({ status: "Pending" });
    const submittedManuscripts = await Submission.countDocuments();

    res.json({
      totalBooks,
      activeUsers,
      pendingOrders,
      submittedManuscripts,
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


//user management
router.get('/users', authAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password -confirmpassword');
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});


router.patch('/users/:userId/block', authAdmin, async (req, res) => {
    const { isBlocked } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { isBlocked },
            { new: true, select: '-password -confirmpassword' }
        );
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully.`, user });
    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({ message: 'Error updating user status', error: error.message });
    }
});

//author submissions
router.get('/submissions', authAdmin, async (req, res) => {
    try {
        const submissions = await Submission.find()
            .populate('submittedBy', 'username email')
            .sort({ createdAt: -1 });
        res.json(submissions);
    } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({ message: 'Error fetching submissions', error: error.message });
    }
});

router.patch('/submissions/:id/review', authAdmin, async (req, res) => {
    const { status, bookDetails } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    try {
        const submission = await Submission.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!submission) return res.status(404).json({ message: 'Submission not found' });

        if (status === 'Approved') {
            if (!bookDetails || !bookDetails.title || !bookDetails.price) {
                return res.status(400).json({ message: 'Missing required book details for publication.' });
            }

            const newBook = new Book({
                ...bookDetails,
                stock: bookDetails.stock || 100,
                isFeatured: bookDetails.isFeatured || false,
            });
            await newBook.save();

            return res.json({ message: 'Submission approved and book published', submission, book: newBook });
        }

        res.json({ message: `Submission ${status.toLowerCase()}`, submission });
    } catch (error) {
        console.error("Error processing submission review:", error);
        res.status(500).json({ message: 'Error processing submission review', error: error.message });
    }
});

router.put('/submissions/:id', authAdmin, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const { status, notes } = req.body;
    if (status) submission.status = status;
    if (notes) submission.notes = notes;

    await submission.save();
    res.json({ message: 'Submission updated', submission });
  } catch (err) {
    console.error('Admin update submission error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

//delete submission
router.delete('/submissions/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    await Submission.findByIdAndDelete(id);
    res.json({ message: "Submission deleted successfully" });
  } catch (err) {
    console.error("Delete submission error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


//order management
router.get('/orders', authAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate('items.bookId', 'title author price imageUrl')
            .populate('userId', 'username email');

        res.json(orders);
    } catch (error) {
        console.error("Error fetching all orders:", error);
        res.status(500).json({ message: 'Error fetching all orders', error: error.message });
    }
});

//user dashboard
router.get('/dashboard/user', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        if (decoded.role !== 'user') return res.status(403).json({ message: "Access denied: Users only" });

        try {
            const userOrders = await Order.find({ userId: decoded.userId }).populate('items.bookId', 'title author price imageUrl');
            const userSubmissions = await Submission.find({ authorId: decoded.userId }).sort({ createdAt: -1 });

            res.json({
                orders: userOrders,
                submissions: userSubmissions
            });
        } catch (error) {
            console.error("Error fetching user dashboard info:", error);
            res.status(500).json({ message: 'Error fetching dashboard info', error: error.message });
        }
    });
});


module.exports = router;