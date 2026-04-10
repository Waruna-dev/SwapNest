import express from 'express';
const router = express.Router();

import { authAdmin, getAllUsers, deleteUser, updateUser } from '../controllers/adminController.js';
import { protect, admin } from '../middlewares/authMiddleware.js'; 

// --- PUBLIC ADMIN ROUTES ---
router.post('/login', authAdmin);

// --- SECURE ADMIN ROUTES ---
// Every route below this point requires the user to be logged in AND have the 'admin' role
router.get('/users', protect, admin, getAllUsers);

router.delete('/users/:id', protect, admin, deleteUser);

router.put('/users/:id', protect, admin, updateUser);

export default router;