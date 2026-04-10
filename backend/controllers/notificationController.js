import Notification from "../models/Notification.js";

// Get user notifications
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { limit = 20, unreadOnly = false } = req.query;
    
    let filter = { userId };
    if (unreadOnly === 'true') {
      filter.read = false;
    }
    
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    const unreadCount = await Notification.countDocuments({ userId, read: false });
    
    res.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    
    notification.read = true;
    await notification.save();
    
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );
    
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get unread count (for badge)
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.params.userId;
    const count = await Notification.countDocuments({ userId, read: false });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};