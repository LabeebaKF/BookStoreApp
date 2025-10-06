const express = require('express');
const router = express.Router();
const userModel = require('../Models/userModel');
const jwt = require('jsonwebtoken');
const { verifyToken, authAdmin } = require('../middleware/auth');
const Book = require('../Models/bookModel');
const profileController = require('../controllers/profileController');
const wishlistController = require('../controllers/wishlistController');
const svgCaptcha = require('svg-captcha');

 // ==========================
// USER REGISTRATION
// ==========================
router.post('/register', async (req, res) => {
  try {
    console.log('Register request body:', req.body);
    const { username, phoneno, address, password, confirmpassword, captcha } = req.body;

    // Check all required fields
    if (!username || !password || !confirmpassword) {
      console.log('Registration failed: Missing required fields');
      return res.status(400).json({ message: 'Username, password, and confirm password are required.' });
    }

    // Verify captcha
    // Temporarily disabled for testing
    // if (!req.session.captcha) {
    //   console.log('Registration failed: No captcha in session');
    //   return res.status(400).json({ message: 'Captcha session missing' });
    // }
    // if (captcha.toLowerCase() !== req.session.captcha.toLowerCase()) {
    //   console.log('Registration failed: Captcha mismatch');
    //   return res.status(400).json({ message: 'Invalid captcha' });
    // }

    // Check existing user
    const existingUser = await userModel.findOne({ username });
    if (existingUser) {
      console.log('Registration failed: User already exists');
      return res.status(409).json({ message: 'User with this username already exists.' });
    }

    // Check password confirmation
    if (password !== confirmpassword) {
      console.log('Registration failed: Passwords do not match');
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const newUser = new userModel({
      username,
      phoneno,
      address,
      password: password,
      confirmpassword: confirmpassword
    });

    await newUser.save();

    // Clear captcha after successful registration
    req.session.captcha = null;

    res.status(200).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('User Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// ==========================
// CAPTCHA
// ==========================
router.get('/captcha', (req, res) => {
  const captcha = svgCaptcha.create({
    size: 6, // number of characters
    noise: 3, // random lines
    color: true,
    background: '#f2f2f2',
    ignoreChars: '0o1iIl', // avoids confusing characters
  });
  req.session.captcha = captcha.text; // save captcha text in session
  console.log('Captcha generated and set in session:', captcha.text);
  res.type('svg');
  res.status(200).send(captcha.data);
});
// ==========================
// USER LOGIN
// ==========================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('User login attempt:', { username, password: password ? 'provided' : 'missing' });
    console.log('Login request body:', req.body);
    if (!username || !password) return res.status(400).json({ message: 'Missing credentials' });

    const user = await userModel.findOne({ username });
    console.log('User found:', user ? 'yes' : 'no');
    if (user) {
      console.log('Stored password:', user.password);
      console.log('Provided password:', password);
    }
    if (!user) return res.status(401).json({ message: 'Invalid username or password' });
    if (user.isBlocked) return res.status(403).json({ message: 'Account blocked by administrator' });

    // Compare hashed password
    const match = user.password === password;
    console.log('Password match:', match);
    if (!match) return res.status(401).json({ message: 'Invalid username or password' });

    const usertoken = jwt.sign(
      { username: user.username, userId: user._id, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({ message: 'User login successful', usertoken, role: 'user' });
  } catch (err) {
    console.error('User Login Error:', err);
    res.status(500).json({ message: 'Server error during user login.' });
  }
});

// ==========================
// GET USER PROFILE
// ==========================
router.get('/profile', verifyToken, profileController.getUserProfile);

// ==========================
// UPDATE USER PROFILE
// ==========================
router.put('/profile', verifyToken, profileController.updateUserProfile);

// ==========================
// WISHLIST ROUTES
// ==========================
router.post('/wishlist', verifyToken, wishlistController.addBookToWishlist);
router.delete('/wishlist/:bookId', verifyToken, wishlistController.removeBookFromWishlist);

// ==========================
// GET ALL USERS (admin only)
// ==========================
router.get('/all', authAdmin, async (req, res) => {
  try {
    const users = await userModel.find({}, 'username phoneno address isBlocked createdAt updatedAt');
    res.status(200).json(users);
  } catch (err) {
    console.error('Get Users Error:', err);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// ==========================
// BLOCK/UNBLOCK USER (admin only)
// ==========================
router.put('/block/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isBlocked = !user.isBlocked;
    await user.save();
    res.status(200).json({ message: user.isBlocked ? 'User blocked' : 'User unblocked', isBlocked: user.isBlocked });
  } catch (err) {
    console.error('Block/Unblock Error:', err);
    res.status(500).json({ message: 'Server error updating user status' });
  }
});

// ==========================
// ADD REVIEW TO BOOK
// ==========================
router.post('/:id/reviews', verifyToken, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const userId = req.userId;
    if (!rating || !review) return res.status(400).json({ message: 'Rating and review are required' });

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const newReview = { user: userId, rating, review };
    book.reviews.push(newReview);

    await book.save();
    res.status(201).json(newReview);
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ message: 'Failed to add review', error: err.message });
  }
});

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const userModel = require('../Models/userModel');
// const jwt = require('jsonwebtoken');
// const svgCaptcha = require('svg-captcha');
// const { verifyToken, authAdmin } = require('../middleware/auth');
// const Book = require('../Models/bookModel');
// const sendEmail = require('../helpers/sendEmail'); // ✅ new import

// // ---------------- REGISTER ----------------
// router.post('/register', async (req, res) => {
//   try {
//     const { username, phoneno, address, password, confirmpassword, captcha } = req.body;

//     if (!username || !password || !confirmpassword || !captcha) {
//       return res.status(400).json({ message: 'All fields including captcha are required.' });
//     }

//     // 🔹 Check captcha
//     if (!req.session.captcha || captcha.toLowerCase() !== req.session.captcha.toLowerCase()) {
//       return res.status(400).json({ message: 'Invalid captcha' });
//     }

//     const existingUser = await userModel.findOne({ username });
//     if (existingUser) {
//       return res.status(409).json({ message: 'User with this username already exists.' });
//     }

//     const newUser = new userModel({ username, phoneno, address, password, confirmpassword });
//     await newUser.save();
    
//     // clear captcha from session after successful use
//     req.session.captcha = null;

//     // ✅ Send email after successful registration
//     try {
//       await sendEmail({
//         to: username, // assuming username = user’s email
//         subject: 'Welcome to BookStore!',
//         html: `
//           <h2>Welcome to BookStore 📚</h2>
//           <p>Hi ${username},</p>
//           <p>Your registration was successful!</p>
//           <p><b>Username:</b> ${username}</p>
//           <p><b>Password:</b> ${password}</p>
//           <br>
//           <p>Thank you for joining us!</p>
//         `,
//       });
//     } catch (emailError) {
//       console.error('❌ Error sending registration email:', emailError);
//     }

//     res.status(200).json({ message: 'Registration successful' });
//   } catch (error) {
//     console.error('User Registration Error:', error);
//     res.status(500).json({ message: 'Server error during registration.' });
//   }
// });

// // ---------------- CAPTCHA ----------------
// router.get('/captcha', (req, res) => {
//   const captcha = svgCaptcha.create({
//     size: 6,
//     noise: 3,
//     color: true,
//     background: '#f2f2f2',
//     ignoreChars: '0o1iIl',
//   });

//   req.session.captcha = captcha.text;
//   res.type('svg');
//   res.status(200).send(captcha.data);
// });

// // ---------------- LOGIN ----------------
// router.post('/login', async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     if (!username || !password) return res.status(400).json({ message: 'Missing credentials' });

//     const user = await userModel.findOne({ username });
//     if (!user || user.password !== password) return res.status(401).json({ message: 'Invalid username or password' });
//     if (user.isBlocked) return res.status(403).json({ message: 'Account blocked by administrator' });

//     const usertoken = jwt.sign(
//       { username: user.username, userId: user._id, role: 'user' },
//       process.env.JWT_SECRET,
//       { expiresIn: '2h' }
//     );

//     res.status(200).json({ message: 'User login successful', usertoken, role: 'user' });
//   } catch (err) {
//     console.error('User Login Error:', err);
//     res.status(500).json({ message: 'Server error during user login.' });
//   }
// });

// // ---------------- ADMIN: GET ALL USERS ----------------
// router.get('/all', authAdmin, async (req, res) => {
//   try {
//     const users = await userModel.find({}, 'username phoneno address isBlocked createdAt updatedAt');
//     res.status(200).json(users);
//   } catch (err) {
//     console.error('Get Users Error:', err);
//     res.status(500).json({ message: 'Server error fetching users' });
//   }
// });

// // ---------------- ADMIN: BLOCK/UNBLOCK ----------------
// router.put('/block/:id', authAdmin, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const user = await userModel.findById(id);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     user.isBlocked = !user.isBlocked;
//     await user.save();
//     res.status(200).json({ message: user.isBlocked ? 'User blocked' : 'User unblocked', isBlocked: user.isBlocked });
//   } catch (err) {
//     console.error('Block/Unblock Error:', err);
//     res.status(500).json({ message: 'Server error updating user status' });
//   }
// });

// // ---------------- GET PROFILE ----------------
// router.get('/profile', verifyToken, async (req, res) => {
//   try {
//     if (!req.userId) return res.status(401).json({ message: 'Unauthorized: No userId found in token' });
//     const user = await userModel.findById(req.userId, 'username phoneno address isBlocked createdAt updatedAt');
//     if (!user) return res.status(404).json({ message: 'User not found' });
//     res.status(200).json(user);
//   } catch (err) {
//     console.error('Fetch Profile Error:', err);
//     res.status(500).json({ message: 'Server error fetching profile', error: err.message });
//   }
// });

// // ---------------- ADD REVIEW ----------------
// router.post('/:id/reviews', verifyToken, async (req, res) => {
//   try {
//     const { rating, review } = req.body;
//     const userId = req.userId;
//     if (!rating || !review) return res.status(400).json({ message: 'Rating and review are required' });

//     const book = await Book.findById(req.params.id);
//     if (!book) return res.status(404).json({ message: 'Book not found' });

//     const newReview = { user: userId, rating, review };
//     book.reviews.push(newReview);
//     await book.save();

//     res.status(201).json(newReview);
//   } catch (err) {
//     console.error('Error adding review:', err);
//     res.status(500).json({ message: 'Failed to add review', error: err.message });
//   }
// });

// // ---------------- UPDATE PROFILE ----------------
// router.put('/profile', verifyToken, async (req, res) => {
//   try {
//     if (!req.userId) return res.status(401).json({ message: 'Unauthorized: No userId found in token' });

//     const { username, phoneno, address, password } = req.body;
//     const user = await userModel.findById(req.userId);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     user.username = username || user.username;
//     user.phoneno = phoneno || user.phoneno;
//     user.address = address || user.address;
//     if (password) user.password = password;

//     await user.save();
//     res.status(200).json({ message: 'Profile updated', username: user.username, phoneno: user.phoneno, address: user.address });
//   } catch (err) {
//     console.error('Update Profile Error:', err);
//     res.status(500).json({ message: 'Server error updating profile', error: err.message });
//   }
// });

// module.exports = router;
