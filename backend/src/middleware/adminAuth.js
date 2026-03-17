const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate admin users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const adminAuth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if token exists
    if (!token) {
      logger.error('Admin auth failed: No token provided');
      return res.status(401).json({ error: 'No authentication token, access denied' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev');

      // Check if user is admin
      if (!decoded.isAdmin) {
        logger.error(`User ${decoded.id} attempted admin access without privileges`);
        return res.status(403).json({ error: 'Access denied. Admin privileges required' });
      }

      // Add user data to request
      req.user = decoded;
      next();
    } catch (err) {
      logger.error(`Token verification failed: ${err.message}`);
      res.status(401).json({ error: 'Token is not valid' });
    }
  } catch (error) {
    logger.error(`Admin auth error: ${error.message}`);
    res.status(500).json({ error: 'Server error in authentication' });
  }
};

module.exports = adminAuth;
