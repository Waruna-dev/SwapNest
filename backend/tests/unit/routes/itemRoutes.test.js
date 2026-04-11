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

// Mock the controller
jest.unstable_mockModule('../../../controllers/itemController.js', () => ({
  createItem: jest.fn(),
  getItems: jest.fn(),
  getItemById: jest.fn(),
  updateItem: jest.fn(),
  deleteItem: jest.fn(),
  getNearbyItems: jest.fn(),
  getSuggestions: jest.fn(),
  getTrendingItems: jest.fn(),
  getSimilarItems: jest.fn(),
}));

// Mock upload middleware
jest.unstable_mockModule('../../../middlewares/item-upload.js', () => ({
  default: {
    array: jest.fn(() => (req, res, next) => next()),
  },
}));

// Import the routes file
await import('../../../routes/itemRoutes.js');

describe('Item Routes Mapping', () => {
  it('should define the correct routes', () => {
    expect(mockRouter.get).toHaveBeenCalledWith('/', expect.anything());
    expect(mockRouter.post).toHaveBeenCalledWith('/', expect.anything(), expect.anything());
    expect(mockRouter.get).toHaveBeenCalledWith('/nearby', expect.anything());
  });
});
