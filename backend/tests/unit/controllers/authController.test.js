import { jest } from '@jest/globals';

// Mock the model
jest.unstable_mockModule('../../../models/User.js', () => ({
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    save: jest.fn(),
  },
}));

// Mock the email utility to avoid Resend crash
jest.unstable_mockModule('../../../utils/sendEmail.js', () => ({
  default: jest.fn().mockResolvedValue({ id: 'mock-id' }),
}));

// Mock bcrypt
jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    compare: jest.fn().mockResolvedValue(true),
    hash: jest.fn().mockResolvedValue('hashedPassword'),
    genSalt: jest.fn().mockResolvedValue('salt'),
  },
}));

const { registerUser, loginUser } = await import('../../../controllers/authController.js');
const { default: User } = await import('../../../models/User.js');

describe('Auth Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {}, user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      req.body = { username: 'test', email: 'test@test.com', password: 'password123' };
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: '123',
        _id: '123',
        username: 'test',
        role: 'user',
        email: 'test@test.com'
      });

      await registerUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return error if user exists', async () => {
      req.body = { email: 'exists@test.com' };
      User.findOne.mockResolvedValue({ email: 'exists@test.com' });
      
      try {
        await registerUser(req, res, next);
      } catch (e) {
        expect(res.status).toHaveBeenCalledWith(400);
      }
    });
  });
});
