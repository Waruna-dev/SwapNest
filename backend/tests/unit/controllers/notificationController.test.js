import { jest } from '@jest/globals';
import { getUserNotifications, markAsRead, getUnreadCount } from '../../../controllers/notificationController.js';
import Notification from '../../../models/Notification.js';

// Mock Notification model static methods
jest.spyOn(Notification, 'find');
jest.spyOn(Notification, 'findById');
jest.spyOn(Notification, 'countDocuments');

describe('Notification Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getUserNotifications', () => {
    it('should fetch user notifications', async () => {
      req.params.userId = 'user123';
      const mockNotifications = [{ title: 'Note 1' }];
      const mockFind = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockNotifications),
      };
      Notification.find.mockReturnValue(mockFind);
      Notification.countDocuments.mockResolvedValue(1);

      await getUserNotifications(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        success: true, 
        unreadCount: 1,
        data: mockNotifications
      }));
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      req.params.id = 'note123';
      const mockNote = { read: false, save: jest.fn() };
      Notification.findById.mockResolvedValue(mockNote);

      await markAsRead(req, res);

      expect(mockNote.read).toBe(true);
      expect(mockNote.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });
});
