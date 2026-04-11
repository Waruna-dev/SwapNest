import { jest } from '@jest/globals';

// Mock User model
jest.unstable_mockModule('../../../models/User.js', () => ({
  default: {
    findOne: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    deleteOne: jest.fn(),
  },
}));

// Mock generateToken
jest.unstable_mockModule('../../../utils/generateToken.js', () => ({
  default: jest.fn(() => 'fake-token'),
}));

const { authAdmin, getAllUsers } = await import('../../../controllers/adminController.js');
const { default: User } = await import('../../../models/User.js');

describe('Admin Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authAdmin', () => {
    it('should authenticate admin and return token', async () => {
      req.body = { email: 'admin@test.com', password: 'password' };
      const mockUser = {
        _id: 'admin123',
        name: 'Admin',
        email: 'admin@test.com',
        role: 'admin',
        matchPassword: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(mockUser);

      await authAdmin(req, res, next);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin', token: 'fake-token' }));
    });

    it('should deny access if user is not admin', async () => {
      req.body = { email: 'user@test.com', password: 'password' };
      const mockUser = {
        role: 'user',
        matchPassword: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(mockUser);

      try {
        await authAdmin(req, res, next);
      } catch (e) {
        expect(res.status).toHaveBeenCalledWith(403);
      }
    });
  });

  describe('getAllUsers', () => {
    it('should fetch all users successfully', async () => {
      const mockUsers = [{ username: 'User1' }, { username: 'User2' }];
      const mockSelect = { select: jest.fn().mockResolvedValue(mockUsers) };
      User.find.mockReturnValue(mockSelect);

      await getAllUsers(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });
  });
});
