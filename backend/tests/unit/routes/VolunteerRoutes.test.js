import { jest } from '@jest/globals';
import express from 'express';

const mockRouter = {
  get: jest.fn().mockReturnThis(),
  post: jest.fn().mockReturnThis(),
  put: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  use: jest.fn().mockReturnThis(),
};
jest.spyOn(express, 'Router').mockReturnValue(mockRouter);

jest.unstable_mockModule('../../../controllers/VolunteerController.js', () => ({
  getVolunteers: jest.fn(),
  getVolunteerById: jest.fn(),
  addVolunteer: jest.fn(),
  updateVolunteer: jest.fn(),
  deleteVolunteer: jest.fn(),
}));

await import('../../../routes/VolunteerRoutes.js');

describe('Volunteer Routes Mapping', () => {
  it('should define the correct routes', () => {
    expect(mockRouter.get).toHaveBeenCalledWith('/', expect.anything());
    expect(mockRouter.post).toHaveBeenCalledWith('/', expect.anything());
  });
});
