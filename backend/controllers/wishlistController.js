// const Wishlist = require('../Models/wishlistModel'); // New Model
// const Book = require('../Models/bookModel'); // Adjust path to match your structure

// /**
//  * @desc    Add a book to the user's wishlist
//  * @route   POST /user/wishlist
//  * @access  Private
//  */
// exports.addBookToWishlist = async (req, res) => {
//     const userId = req.userId; // Uses req.userId from verifyToken
//     const { bookId } = req.body;

//     if (!bookId) {
//         return res.status(400).json({ message: 'bookId is required.' });
//     }
    
//     // Optional: Validate if book exists
//     const book = await Book.findById(bookId);
//     if (!book) {
//         return res.status(404).json({ message: 'Book not found.' });
//     }

//     try {
//         let wishlist = await Wishlist.findOne({ userId: userId });

//         if (!wishlist) {
//             // Create a new wishlist if one doesn't exist
//             wishlist = await Wishlist.create({ userId: userId, books: [bookId] });
//             return res.status(201).json({ message: `${book.title} added to new Wishlist successfully!` });
//         }

//         // Check if the book is already in the wishlist
//         // .some() checks if any element matches the condition
//         if (wishlist.books.some(book => book.equals(bookId))) {
//             return res.status(400).json({ message: `${book.title} is already in the wishlist.` });
//         }

//         // Add the new book
//         wishlist.books.push(bookId);
//         await wishlist.save();
        
//         res.status(200).json({ message: `${book.title} added to Wishlist successfully!` });

//     } catch (error) {
//         console.error("Error adding to wishlist:", error);
//         res.status(500).json({ message: 'Server error while adding to wishlist.' });
//     }
// };

// /**
//  * @desc    Remove a book from the user's wishlist
//  * @route   DELETE /user/wishlist/:bookId
//  * @access  Private
//  */
// exports.removeBookFromWishlist = async (req, res) => {
//     const userId = req.userId; // Uses req.userId from verifyToken
//     const { bookId } = req.params;

//     try {
//         const wishlist = await Wishlist.findOne({ userId: userId });

//         if (!wishlist) {
//             return res.status(404).json({ message: 'Wishlist not found.' });
//         }

//         const initialLength = wishlist.books.length;
//         // Filter out the bookId (using .toString() for comparison)
//         wishlist.books = wishlist.books.filter(
//             (book) => book.toString() !== bookId
//         );

//         if (wishlist.books.length === initialLength) {
//             return res.status(404).json({ message: 'Book not found in wishlist.' });
//         }

//         await wishlist.save();
        
//         res.status(200).json({ message: 'Book removed from Wishlist successfully.' });

//     } catch (error) {
//         console.error("Error removing from wishlist:", error);
//         res.status(500).json({ message: 'Server error while removing from wishlist.' });
//     }
// };

// Path: ../controllers/wishlistController.js (FIXED VERSION)

// Use userModel to update the user's document directly
const userModel = require('../Models/userModel'); 
const Book = require('../Models/bookModel'); // Still required for book validation

/**
 * @desc    Add a book to the user's wishlist
 * @route   POST /user/wishlist
 * @access  Private
 */
exports.addBookToWishlist = async (req, res) => {
    // req.userId is securely set by your verifyToken middleware
    const userId = req.userId; 
    const { bookId } = req.body;

    if (!bookId) {
        return res.status(400).json({ message: 'Book ID is required.' });
    }

    try {
        // --- 1. Validate: Check if the book exists ---
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found.' });
        }

        // --- 2. Core Logic: Use $addToSet on the userModel ---
        // $addToSet: Adds bookId to the 'wishlist' array only if it's not already present.
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $addToSet: { wishlist: bookId } },
            { new: true } // Return the updated user document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        // Since $addToSet handles uniqueness, a 200 is appropriate for success/no change
        return res.status(200).json({ 
            message: `${book.title} added to wishlist successfully (or was already present).`,
            wishlist: updatedUser.wishlist
        });

    } catch (error) {
        // Catch Mongoose CastError for invalid ID formats
        if (error.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid Book ID or User ID format.' });
        }
        console.error("Error adding book to wishlist:", error);
        // The generic 500 error remains for unexpected server issues
        return res.status(500).json({ message: 'Server error while adding to wishlist.' }); 
    }
};

/**
 * @desc    Remove a book from the user's wishlist (Updated to use userModel)
 * @route   DELETE /user/wishlist/:bookId
 * @access  Private
 */
exports.removeBookFromWishlist = async (req, res) => {
    const userId = req.userId;
    const { bookId } = req.params;

    try {
        // Use $pull to remove the bookId from the wishlist array
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $pull: { wishlist: bookId } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        // Check if the book was actually removed (optional, but good for feedback)
        const wasRemoved = !updatedUser.wishlist.some(id => id.toString() === bookId);

        if (wasRemoved) {
            return res.status(200).json({ message: 'Book removed from Wishlist successfully.' });
        } else {
            return res.status(404).json({ message: 'Book not found in wishlist.' });
        }

    } catch (error) {
        if (error.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid ID format provided.' });
        }
        console.error("Error removing from wishlist:", error);
        return res.status(500).json({ message: 'Server error while removing from wishlist.' });
    }
};
// You can remove or update getUserWishlist as needed.
// exports.getUserWishlist = ...
