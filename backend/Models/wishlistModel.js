const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
    // Refers to the userdetails model
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userdetails',
        required: true,
        unique: true
    },
    books: [{
        // Refers to the bookdetails model
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bookdetails'
    }]
}, { timestamps: true });

// Note: Using 'wishlists' as the collection name
module.exports = mongoose.model('wishlists', WishlistSchema);
