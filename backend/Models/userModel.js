const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    username: String,
    phoneno: Number,
    address: String,
    password: String,
    confirmpassword: String,
    isBlocked: { type: Boolean, default: false },
wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'bookdetails' }]
}, { timestamps: true });


module.exports = mongoose.model('userdetails', userSchema);
