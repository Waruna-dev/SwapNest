import express from 'express';
const router = express.Router();
import {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from '../controllers/notificationController.js';

// Create a new notification
router.post('/', createNotification);

// Get user notifications
router.get('/user/:userId', getUserNotifications);

// Get unread count
router.get('/user/:userId/count', getUnreadCount);

// Mark notification as read
router.put('/:id/read', markAsRead);

// Mark all as read
router.put('/user/:userId/read-all', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

export default router;