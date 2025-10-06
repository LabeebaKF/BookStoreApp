const Cart = require('../Models/cartModel');
const Book = require('../Models/bookModel');

exports.getCart = async (req, res) => {
    try {
        const userId = req.userId;
        const cart = await Cart.findOne({ userId }).populate('items.bookId');
        if (!cart) return res.status(200).json({ items: [] });
        res.status(200).json(cart);
    } catch (err) {
        console.error("Fetch Cart Error:", err);
        res.status(500).json({ message: 'Server error fetching cart' });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const userId = req.userId;
        const { bookId, quantity } = req.body;

        if (!bookId) return res.status(400).json({ message: 'Book ID is required' });

        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [{ bookId, quantity: quantity || 1 }] });
        } else {
            const itemIndex = cart.items.findIndex(i => i.bookId.toString() === bookId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity || 1;
            } else {
                cart.items.push({ bookId, quantity: quantity || 1 });
            }
        }

        await cart.save();
        const populatedCart = await Cart.findOne({ userId }).populate('items.bookId');
        res.status(200).json(populatedCart);
    } catch (err) {
        console.error("Add to Cart Error:", err);
        res.status(500).json({ message: 'Server error adding to cart' });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.userId;
        const { bookId } = req.params;

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = cart.items.filter(i => i.bookId.toString() !== bookId);
        await cart.save();

        const populatedCart = await Cart.findOne({ userId }).populate('items.bookId');
        res.status(200).json(populatedCart);
    } catch (err) {
        console.error("Remove from Cart Error:", err);
        res.status(500).json({ message: 'Server error removing from cart' });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const userId = req.userId;
        const { bookId, quantity } = req.body;

        if (!bookId || !quantity) return res.status(400).json({ message: 'Book ID and quantity required' });

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const itemIndex = cart.items.findIndex(i => i.bookId.toString() === bookId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            await cart.save();
            const populatedCart = await Cart.findOne({ userId }).populate('items.bookId');
            res.status(200).json(populatedCart);
        } else {
            return res.status(404).json({ message: 'Book not found in cart' });
        }
    } catch (err) {
        console.error("Update Cart Error:", err);
        res.status(500).json({ message: 'Server error updating cart' });
    }
};
