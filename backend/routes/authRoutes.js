const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');

// Import the middleware
const { protect } = require('../middlewares/authMiddleware');

// Public Routes (No Guard needed)
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected Route (Guard is placed here!)
// The request goes: Browser -> 'protect' -> 'getMe'
router.get('/me', protect, getMe);

module.exports = router;