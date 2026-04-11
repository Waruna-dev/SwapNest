import { jest } from '@jest/globals';
import { createPickup, getAllPickups, getPickupById } from '../../../controllers/PickupController.js';
import Pickup from '../../../models/PickupModel.js';

// Mock Pickup model static methods
jest.spyOn(Pickup, 'create');
jest.spyOn(Pickup, 'find');
jest.spyOn(Pickup, 'findById');
jest.spyOn(Pickup, 'countDocuments');

describe('Pickup Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, query: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('createPickup', () => {
    it('should create a pickup successfully', async () => {
      req.body = { name: 'John', phone: '123', method: 'pickup', address: '123 St', date: new Date() };
      Pickup.create.mockResolvedValue(req.body);

      await createPickup(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  describe('getAllPickups', () => {
    it('should fetch all pickups', async () => {
      const mockPickups = [{ name: 'John' }];
      const mockFind = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockPickups),
      };
      Pickup.find.mockReturnValue(mockFind);
      Pickup.countDocuments.mockResolvedValue(1);

      await getAllPickups(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ total: 1 }));
    });
  });
});
