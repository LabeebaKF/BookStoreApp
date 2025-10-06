const express = require('express');
const router = express.Router();
const Order = require('../Models/orderModel');
const Book = require('../Models/bookModel');
const User = require('../Models/userModel');
const { verifyToken, authAdmin } = require('../middleware/auth');

router.use(express.json());

router.post('/place', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        console.log('1. User ID from Token:', userId); 
        
        const { items, totalAmount } = req.body;

        if (!items?.length || totalAmount === undefined) {
            console.log('1a. Rejected: Invalid order data.');
            return res.status(400).json({ message: 'Invalid order data' });
        }

        const user = await User.findById(userId);
        if (!user) {
            console.log('2. Rejected: User not found for ID:', userId); 
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('3. Starting Stock Validation...');
        for (const item of items) {
            const book = await Book.findById(item.bookId);
            
            if (!book) {
                console.log('3a. Rejected: Book not found:', item.bookId); 
                return res.status(404).json({ message: `Book not found: ${item.bookId}` });
            }
            if (book.stock < item.quantity) {
                console.log('3b. Rejected: Insufficient stock for:', book.title); 
                return res.status(400).json({ message: `Insufficient stock for ${book.title}` });
            }
        }
        console.log('4. Stock checks passed. Preparing to Save Order...');
        
        const newOrder = new Order({ userId, userName: user.username, items, totalAmount });
        await newOrder.save();
        
        console.log('5. Order saved successfully! ID:', newOrder._id); 

        res.status(201).json({ message: 'Order placed successfully', orderId: newOrder._id });
        
    } catch (err) {
        console.error('SERVER ERROR placing order:', err.message, err.stack); 
        res.status(500).json({ message: 'Server error' });
    }
});

// order history for user
router.get('/history', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;

        // Fetch all orders for the user
        const orders = await Order.find({ userId: userId }) 
            .sort({ createdAt: -1 })
            .populate({
                path: 'items.bookId',
                select: 'title author price imageUrl'
            });

        res.status(200).json(orders);
    } catch (err) {
        console.error('Error fetching order history:', err);
        res.status(500).json({ message: 'Server error fetching order history.' });
    }
});

//fetch all orders
router.get('/all', verifyToken, authAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate({ path: 'userId', select: 'username email' })   
            .populate({ path: 'items.bookId', select: 'title author price imageUrl' }); 

        res.status(200).json(orders);
    } catch (err) {
        console.error('Error fetching all orders:', err);
        res.status(500).json({ message: 'Server error fetching all orders.' });
    }
});

router.get('/:id', verifyToken, async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.userId;

        const order = await Order.findById(orderId)
            .populate({ path: 'items.bookId', select: 'title author price imageUrl' });

        if (!order) return res.status(404).json({ message: 'Order not found.' });
        if (order.userId.toString() !== userId)
            return res.status(403).json({ message: 'Unauthorized access to order details.' });

        res.status(200).json(order);
    } catch (err) {
        console.error('Error fetching single order:', err);
        res.status(500).json({ message: 'Server error fetching order details.' });
    }
});

// Update order status by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Server error updating order' });
  }
});

module.exports = router;
