import { jest } from '@jest/globals';
import { getItems, getItemById } from '../../../controllers/itemController.js';
import Item from '../../../models/Item.js';

// Mock Item model static methods
jest.spyOn(Item, 'find');
jest.spyOn(Item, 'countDocuments');
jest.spyOn(Item, 'findOne');

describe('Item Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getItems', () => {
    it('should return a list of items with pagination', async () => {
      const mockItems = [{ title: 'Item 1' }, { title: 'Item 2' }];
      
      const mockFind = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockItems),
      };
      
      Item.find.mockReturnValue(mockFind);
      Item.countDocuments.mockResolvedValue(10);

      await getItems(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const responseBody = res.json.mock.calls[0][0];
      expect(responseBody.items).toEqual(mockItems);
      expect(responseBody.totalItems).toBe(10);
    });
  });

  describe('getItemById', () => {
    it('should return 404 if item not found', async () => {
      req.params.id = 'nonexistent';
      Item.findOne.mockResolvedValue(null);

      await getItemById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Item not found' });
    });

    it('should return item if found', async () => {
      const mockItem = { title: 'Found Item', views: 0, save: jest.fn() };
      req.params.id = 'exists';
      Item.findOne.mockResolvedValue(mockItem);

      await getItemById(req, res, next);

      expect(res.json).toHaveBeenCalledWith(mockItem);
    });
  });
});
