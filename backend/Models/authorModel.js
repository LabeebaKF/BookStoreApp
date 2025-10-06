const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // email
  phoneno: { type: Number, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  isBlocked: { type: Boolean, default: false },
}, { timestamps: true });

// Dummy method for password check (no hashing)
authorSchema.methods.matchPassword = function (enteredPassword) {
  return enteredPassword === this.password;
};

module.exports = mongoose.model("authordetails", authorSchema);
