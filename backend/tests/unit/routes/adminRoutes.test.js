import { jest } from '@jest/globals';
import express from 'express';

const mockRouter = {
  get: jest.fn().mockReturnThis(),
  post: jest.fn().mockReturnThis(),
  put: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
};
jest.spyOn(express, 'Router').mockReturnValue(mockRouter);

jest.unstable_mockModule('../../../controllers/adminController.js', () => ({
  authAdmin: jest.fn(),
  getAllUsers: jest.fn(),
  deleteUser: jest.fn(),
  updateUser: jest.fn(),
}));

jest.unstable_mockModule('../../../middlewares/authMiddleware.js', () => ({
  protect: jest.fn((req, res, next) => next()),
  admin: jest.fn((req, res, next) => next()),
}));

await import('../../../routes/adminRoutes.js');

describe('Admin Routes Mapping', () => {
  it('should define the correct routes', () => {
    expect(mockRouter.post).toHaveBeenCalledWith('/login', expect.anything());
    expect(mockRouter.get).toHaveBeenCalledWith('/users', expect.anything(), expect.anything(), expect.anything());
  });
});
