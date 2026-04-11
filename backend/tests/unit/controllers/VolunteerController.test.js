import { jest } from '@jest/globals';
import { getVolunteers, getVolunteerById, addVolunteer } from '../../../controllers/VolunteerController.js';
import Volunteer from '../../../models/VolunteerModel.js';

// Mock Volunteer model static methods
jest.spyOn(Volunteer, 'find');
jest.spyOn(Volunteer, 'findById');
jest.spyOn(Volunteer.prototype, 'save');

describe('Volunteer Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, query: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getVolunteers', () => {
    it('should fetch all volunteers', async () => {
      const mockVolunteers = [{ firstName: 'Jane' }];
      const mockFind = { sort: jest.fn().mockResolvedValue(mockVolunteers) };
      Volunteer.find.mockReturnValue(mockFind);

      await getVolunteers(req, res);

      expect(res.json).toHaveBeenCalledWith(mockVolunteers);
    });
  });

  describe('addVolunteer', () => {
    it('should add a volunteer successfully', async () => {
      req.body = { firstName: 'Jane', lastName: 'Doe', email: 'jane@test.com', nic: '12345', dob: new Date() };
      Volunteer.prototype.save.mockResolvedValue(req.body);

      await addVolunteer(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });
});
