import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notifications';

// Get user notifications
export const getUserNotifications = async (userId, unreadOnly = false) => {
  try {
    const response = await axios.get(`${API_URL}/user/${userId}`, {
      params: { unreadOnly }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get unread count
export const getUnreadCount = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/user/${userId}/count`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
  try {
    const response = await axios.put(`${API_URL}/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Mark all as read
export const markAllAsRead = async (userId) => {
  try {
    const response = await axios.put(`${API_URL}/user/${userId}/read-all`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await axios.delete(`${API_URL}/${notificationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};