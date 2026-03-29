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
  deleteUser,
  googleAuth,
  forgotPassword, 
  resetPassword    
} from '../controllers/authController.js';

// Import middlewares and configs
import { protect, admin, adminOrOwner } from '../middlewares/authMiddleware.js';
import upload from '../config/cloudinary.js';

// --- PUBLIC ROUTES ---
// Anyone can register, log in, or reset their password
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);        // <-- Request reset email
router.post('/reset-password/:token', resetPassword);   // <-- Submit new password

// --- PROTECTED ROUTES (All logged-in users: Users, Volunteers, Admins) ---
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('profileImage'), updateProfile);
router.put('/password', protect, updatePassword);
router.post('/logout', protect, logoutUser); // Moved logout here (usually standard users can log out, not just admins)

// --- ADMIN / OWNER ROUTES ---
router.delete('/:id', protect, adminOrOwner, deleteUser);

export default router;