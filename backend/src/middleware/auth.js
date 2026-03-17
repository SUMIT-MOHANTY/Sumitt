/**
 * Authentication Middleware
 */
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

module.exports = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      logger.warn('No authentication token provided');
      return res.status(401).json({
        success: false,
        message: 'No authentication token, access denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    res.status(401).json({
      success: false,
      message: 'Token is invalid or expired'
    });
  }
};
