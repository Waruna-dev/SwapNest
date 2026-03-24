import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js'; // Must include .js extension!

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const admin = (req, res, next) => {
    // The 'protect' middleware runs first and attaches req.user
    if (req.user && req.user.role === 'admin') {
        next(); // They are an admin, let them proceed!
    } else {
        res.status(403); // 403 Forbidden
        throw new Error('Access denied: Admin privileges required');
    }
};

export { protect, admin };