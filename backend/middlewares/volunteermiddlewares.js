import jwt from "jsonwebtoken";

// 404 handler for unknown routes
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); 
};

// Centralized error handler
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    // Hide stack trace in production
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

// Basic JWT protect middleware. Expects `Authorization: Bearer <token>` header.
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

      // Attach decoded payload to request for downstream handlers
      req.user = decoded;
      return next();
    } catch (error) {
      res.status(401);
      return next(new Error("Not authorized, token failed"));
    }
  }

  res.status(401);
  return next(new Error("Not authorized, no token provided"));
};