const User = require('../Models/userModel'); 
const Order = require('../Models/orderModel'); 

/**
 * @desc    Get user profile details, orders, and wishlist
 * @route   GET /user/profile
 * @access  Private (Requires verifyToken middleware)
 */
exports.getUserProfile = async (req, res) => {
    const userId = req.userId; // ID attached by verifyToken

    try {
        // 1. Fetch User Details
        const user = await User.findById(userId).select('-password -confirmpassword');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // The user object already contains the necessary details.
        // Other data like orders and cart are fetched by separate API calls on the frontend.
        // We can simplify this controller to just return the user data.
        res.status(200).json(user);

    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: 'Server error fetching profile details.' });
    }
};

/**
 * @desc    Update user profile details
 * @route   PUT /user/profile
 * @access  Private
 */
exports.updateUserProfile = async (req, res) => {
    const userId = req.userId;
    const { username, phoneno, address, password } = req.body; 

    try {
        const user = await User.findById(userId);

        if (user) {
            user.username = username || user.username;
            user.phoneno = phoneno || user.phoneno; 
            user.address = address || user.address;

            if (password) {
                user.password = password;
                user.confirmpassword = password; // Also update confirmation if you store it
            }

            const updatedUser = await user.save();

            res.json({
                message: 'Profile updated successfully',
                username: updatedUser.username,
                phoneno: updatedUser.phoneno,
                address: updatedUser.address
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: 'Server error updating profile.' });
    }
};