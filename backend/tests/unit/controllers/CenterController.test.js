import { jest } from '@jest/globals';
import { getAllCenters, getCenterById, createCenter } from '../../../controllers/CenterController.js';
import Center from '../../../models/CenterModel.js';

// Mock Center model static methods
jest.spyOn(Center, 'find');
jest.spyOn(Center, 'findById');
jest.spyOn(Center, 'findOne');

describe('Center Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { query: {}, params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getAllCenters', () => {
    it('should fetch all centers successfully', async () => {
      const mockCenters = [{ centerName: 'Center A' }, { centerName: 'Center B' }];
      const mockFind = { sort: jest.fn().mockResolvedValue(mockCenters) };
      Center.find.mockReturnValue(mockFind);

      await getAllCenters(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ count: 2 }));
    });
  });

  describe('getCenterById', () => {
    it('should return 404 if center not found', async () => {
      req.params.id = 'invalid';
      Center.findById.mockResolvedValue(null);

      await getCenterById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return center data if found', async () => {
      req.params.id = 'valid';
      const mockCenter = { centerName: 'Center A' };
      Center.findById.mockResolvedValue(mockCenter);

      await getCenterById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: mockCenter }));
    });
  });
});
