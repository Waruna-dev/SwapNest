import { jest } from '@jest/globals';
import express from 'express';

const mockRouter = {
  get: jest.fn().mockReturnThis(),
  post: jest.fn().mockReturnThis(),
  put: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
};
jest.spyOn(express, 'Router').mockReturnValue(mockRouter);

jest.unstable_mockModule('../../../controllers/notificationController.js', () => ({
  getUserNotifications: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  deleteNotification: jest.fn(),
  getUnreadCount: jest.fn(),
}));

await import('../../../routes/notificationRoutes.js');

describe('Notification Routes Mapping', () => {
  it('should define the correct routes', () => {
    expect(mockRouter.get).toHaveBeenCalledWith('/user/:userId', expect.anything());
    expect(mockRouter.put).toHaveBeenCalledWith('/:id/read', expect.anything());
  });
});
