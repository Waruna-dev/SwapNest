const express = require('express');
const router = express.Router();

const { 
  registerUser, 
  loginUser, 
  getMe, 
  updateProfile,
  updatePassword 
} = require('../controllers/authController');

const { protect } = require('../middlewares/authMiddleware');
const upload = require('../config/cloudinary');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('profileImage'), updateProfile);

router.put('/password', protect, updatePassword);

module.exports = router;