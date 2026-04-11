import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { createSwapRequest, getSwapById } from '../../../controllers/swapController.js';
import Swap from '../../../models/Swap.js';
import Item from '../../../models/Item.js';
import User from '../../../models/User.js';
import Notification from '../../../models/Notification.js';

// Mock model static methods
jest.spyOn(Swap, 'find');
jest.spyOn(Swap, 'findById');
jest.spyOn(Swap.prototype, 'save').mockImplementation(function() { return Promise.resolve(this); });
jest.spyOn(Item, 'findById');
jest.spyOn(Item.prototype, 'save').mockImplementation(function() { return Promise.resolve(this); });
jest.spyOn(User, 'findById');
jest.spyOn(Notification.prototype, 'save').mockImplementation(function() { return Promise.resolve(this); });

describe('Swap Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {}, files: [] };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('createSwapRequest', () => {
    it('should create a swap request successfully', async () => {
      req.body = {
        itemId: 'item123',
        requesterId: 'user456',
        requesterName: 'Jane',
        swapType: 'item-for-item',
        offeredItem: { name: 'Old Bike' },
        agreementAccepted: true
      };

      const mockItem = {
        _id: new mongoose.Types.ObjectId(),
        title: 'New Bike',
        ownerId: new mongoose.Types.ObjectId(),
        isActive: true,
        save: jest.fn().mockResolvedValue({})
      };

      Item.findById.mockResolvedValue(mockItem);
      User.findById.mockResolvedValue({ username: 'OwnerName' });
      // We don't need to mock Swap.prototype.save again here since we did it above

      await createSwapRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  describe('getSwapById', () => {
    it('should return 404 if swap not found', async () => {
      req.params.id = 'invalid';
      Swap.findById.mockResolvedValue(null);

      await getSwapById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
