import express from 'express';
const router = express.Router();

// Import controllers
import { 
  registerUser, 
  loginUser, 
  logoutUser,
  getMe, 
  updateProfile,
  updatePassword,
  deleteUser 
} from '../controllers/authController.js';

// Import middlewares and configs
// 1. We imported the 'admin' middleware here
import { protect, admin, adminOrOwner } from '../middlewares/authMiddleware.js';
import upload from '../config/cloudinary.js';

// --- PUBLIC ROUTES ---
// Anyone can register or log in
router.post('/register', registerUser);
router.post('/login', loginUser);

// --- PROTECTED ROUTES (All logged-in users: Users, Volunteers, Admins) ---
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('profileImage'), updateProfile);
router.put('/password', protect, updatePassword);

// --- ADMIN ONLY ROUTES ---
// 2. We added both 'protect' and 'admin' middlewares here
router.delete('/:id', protect, adminOrOwner, deleteUser);
router.post('/logout', protect, logoutUser);

export default router;