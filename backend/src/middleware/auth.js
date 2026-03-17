/**
 * Authentication middleware for protected routes
 * Verifies JWT tokens and adds user data to request
 */
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');

/**
 * Middleware function to verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyToken = (req, res, next) => {
  // Get token from header
  const token = req.headers['x-access-token'] || req.headers['authorization'];

  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'No token provided'
    });
  }

  // Clean the token if it's in 'Bearer <token>' format
  const tokenValue = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

  try {
    // Verify token
    const decoded = jwt.verify(tokenValue, config.secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - invalid token',
      error: error.message
    });
  }
};

module.exports = {
  verifyToken
};
