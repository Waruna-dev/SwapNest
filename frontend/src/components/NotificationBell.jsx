import React, { useState, useEffect, useRef } from 'react';
import { getUserNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../services/notificationService';

// Manual time formatter
const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' year ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' month ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' day ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hour ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minute ago';
  
  return Math.floor(seconds) + ' second ago';
};

const NotificationBell = ({ userId, onNotificationClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (userId) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount(userId);
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await getUserNotifications(userId);
      setNotifications(response.data);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      await markAsRead(notification._id);
      
      // Close dropdown
      setIsOpen(false);
      
      // Call parent callback to open modal with swap details
      if (notification.swapId && onNotificationClick) {
        onNotificationClick(notification.swapId);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(userId);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'swap_request':
        return '📨';
      case 'swap_accepted':
        return '✅';
      case 'swap_rejected':
        return '❌';
      case 'swap_cancelled':
        return '🚫';
      case 'swap_completed':
        return '🎉';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'swap_accepted':
        return 'text-green-600 bg-green-50';
      case 'swap_rejected':
        return 'text-red-600 bg-red-50';
      case 'swap_completed':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-primary bg-primary-fixed/10';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-surface-container-high transition-colors"
      >
        <span className="material-symbols-outlined text-2xl text-on-surface-variant">
          notifications
        </span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-error text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-outline-variant z-50 overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-outline-variant bg-surface">
            <h3 className="font-headline font-bold text-on-surface">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary hover:text-primary-container font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-2 block">🔔</span>
                <p className="text-on-surface-variant">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-outline-variant hover:bg-surface-container-low transition-colors cursor-pointer ${
                    !notification.read ? 'bg-primary-fixed/5' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                      <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-on-surface text-sm">
                        {notification.title}
                      </p>
                      <p className="text-sm text-on-surface-variant mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-2">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                      <p className="text-xs text-primary mt-1 flex items-center gap-1">
                        <span>🔗</span> Click to view details
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;