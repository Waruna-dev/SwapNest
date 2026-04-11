import { jest } from '@jest/globals';
import User from '../../../models/User.js';
import bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('User Model', () => {
  it('should have a matchPassword method', async () => {
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    bcrypt.compare = jest.fn().mockResolvedValue(true);
    const result = await user.matchPassword('password123');
    
    expect(result).toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'password123');
  });

  it('should fail validation if username is missing', async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'password123'
    });

    const err = user.validateSync();
    expect(err.errors.username).toBeDefined();
    expect(err.errors.username.message).toBe('Please add a username');
  });

  it('should fail validation if email is missing', async () => {
    const user = new User({
      username: 'testuser',
      password: 'password123'
    });

    const err = user.validateSync();
    expect(err.errors.email).toBeDefined();
    expect(err.errors.email.message).toBe('Please add an email address');
  });

  it('should have a default role of user', () => {
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    expect(user.role).toBe('user');
  });
});
