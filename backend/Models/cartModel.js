const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userdetails',
        required: true,
        unique: true
    },
    items: [
        {
            bookId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'bookdetails',
                required: true
            },
            quantity: { type: Number, default: 1 }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('carts', CartSchema);
