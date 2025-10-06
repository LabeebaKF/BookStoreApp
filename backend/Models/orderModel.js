const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'userdetails' },
    userName: String,
    items: [{ bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'bookdetails' }, quantity: Number }],
    totalAmount: Number,
    status: { type: String, enum: ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('orderbooks', orderSchema);
