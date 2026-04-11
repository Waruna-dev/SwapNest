import { jest } from '@jest/globals';
import express from 'express';

// Mock the express Router
const mockRouter = {
  get: jest.fn().mockReturnThis(),
  post: jest.fn().mockReturnThis(),
  put: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  patch: jest.fn().mockReturnThis(),
  use: jest.fn().mockReturnThis(),
};
jest.spyOn(express, 'Router').mockReturnValue(mockRouter);

// We must mock the controllers that are used in the routes
jest.unstable_mockModule('../../../controllers/authController.js', () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  getMe: jest.fn(),
  updateProfile: jest.fn(),
  updatePassword: jest.fn(),
  deleteUser: jest.fn(),
  logoutUser: jest.fn(),
  googleAuth: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
}));

// Mock middleware
jest.unstable_mockModule('../../../middlewares/authMiddleware.js', () => ({
  protect: jest.fn((req, res, next) => next()),
  admin: jest.fn((req, res, next) => next()),
  adminOrOwner: jest.fn((req, res, next) => next()),
}));

// Mock cloudinary upload
jest.unstable_mockModule('../../../config/cloudinary.js', () => ({
  default: {
    single: jest.fn(() => (req, res, next) => next()),
    array: jest.fn(() => (req, res, next) => next()),
  },
}));

// Now import the routes file (this will execute the router definitions)
await import('../../../routes/userRoutes.js');

describe('User Routes Mapping', () => {
  it('should define the correct routes', () => {
    expect(mockRouter.post).toHaveBeenCalledWith('/register', expect.anything());
    expect(mockRouter.post).toHaveBeenCalledWith('/login', expect.anything());
    expect(mockRouter.get).toHaveBeenCalledWith('/me', expect.anything(), expect.anything());
  });
});
