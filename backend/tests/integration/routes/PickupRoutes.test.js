import { jest } from '@jest/globals';
import express from 'express';

const mockRouter = {
  get: jest.fn().mockReturnThis(),
  post: jest.fn().mockReturnThis(),
  put: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
};
jest.spyOn(express, 'Router').mockReturnValue(mockRouter);

jest.unstable_mockModule('../../../controllers/PickupController.js', () => ({
  createPickup: jest.fn(),
  getAllPickups: jest.fn(),
  getPickupById: jest.fn(),
  updatePickupStatus: jest.fn(),
  deletePickup: jest.fn(),
}));

await import('../../../routes/PickupRoutes.js');

describe('Pickup Routes Mapping', () => {
  it('should define the correct routes', () => {
    expect(mockRouter.post).toHaveBeenCalledWith('/', expect.anything());
    expect(mockRouter.get).toHaveBeenCalledWith('/', expect.anything());
  });
});
