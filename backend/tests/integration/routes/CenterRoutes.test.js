import { jest } from '@jest/globals';
import express from 'express';

const mockRouter = {
  get: jest.fn().mockReturnThis(),
  post: jest.fn().mockReturnThis(),
  put: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  patch: jest.fn().mockReturnThis(),
  route: jest.fn().mockReturnThis(),
};
jest.spyOn(express, 'Router').mockReturnValue(mockRouter);

jest.unstable_mockModule('../../../controllers/CenterController.js', () => ({
  getAllCenters: jest.fn(),
  getCenterById: jest.fn(),
  createCenter: jest.fn(),
  updateCenter: jest.fn(),
  patchCenter: jest.fn(),
  deleteCenter: jest.fn(),
  updateVolunteerCount: jest.fn(),
  getCentersByDistrict: jest.fn(),
}));

jest.unstable_mockModule('../../../middlewares/centermiddlewares.js', () => ({
  validateCenter: jest.fn((req, res, next) => next()),
  validateCenterUpdate: jest.fn((req, res, next) => next()),
  handleValidationErrors: jest.fn((req, res, next) => next()),
  validateObjectId: jest.fn((req, res, next) => next()),
  validateSearchQuery: jest.fn((req, res, next) => next()),
}));

await import('../../../routes/CenterRoutes.js');

describe('Center Routes Mapping', () => {
  it('should define the correct routes', () => {
    expect(mockRouter.route).toHaveBeenCalledWith('/');
    expect(mockRouter.get).toHaveBeenCalledWith(expect.anything(), expect.anything());
  });
});
