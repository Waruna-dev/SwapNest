import { jest } from '@jest/globals';
import express from 'express';

const mockRouter = {
  get: jest.fn().mockReturnThis(),
  post: jest.fn().mockReturnThis(),
  put: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
};
jest.spyOn(express, 'Router').mockReturnValue(mockRouter);

jest.unstable_mockModule('../../../controllers/swapController.js', () => ({
  createSwapRequest: jest.fn(),
  updateSwapRequest: jest.fn(),
  updateSwapPhotos: jest.fn(),
  getUserSwaps: jest.fn(),
  getSwapById: jest.fn(),
  updateSwapStatus: jest.fn(),
  cancelSwapRequest: jest.fn(),
  getPendingRequests: jest.fn(),
  getAllSwaps: jest.fn(),
  deleteSwap: jest.fn(),
  getSwapsByItem: jest.fn(),
  getCompletionStatus: jest.fn(),
  requestCompletion: jest.fn(),
}));

jest.unstable_mockModule('../../../middlewares/swapCloudinaryUpload.js', () => ({
  uploadSwapPhotos: jest.fn((req, res, next) => next()),
}));

jest.unstable_mockModule('../../../middlewares/validation.js', () => ({
  validateSwapRequest: jest.fn((req, res, next) => next()),
  validateStatusUpdate: jest.fn((req, res, next) => next()),
}));

await import('../../../routes/swapRoutes.js');

describe('Swap Routes Mapping', () => {
  it('should define the correct routes', () => {
    expect(mockRouter.post).toHaveBeenCalledWith('/', expect.anything(), expect.anything(), expect.anything());
    expect(mockRouter.get).toHaveBeenCalledWith('/all', expect.anything());
  });
});
