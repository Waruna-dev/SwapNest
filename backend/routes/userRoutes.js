import express from 'express';
const router = express.Router();

// Import controllers
import { 
  registerUser, 
  loginUser, 
  getMe, 
  updateProfile,
  updatePassword 
} from '../controllers/authController.js';

// Import middlewares and configs
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../config/cloudinary.js';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('profileImage'), updateProfile);
router.put('/password', protect, updatePassword);

export default router;