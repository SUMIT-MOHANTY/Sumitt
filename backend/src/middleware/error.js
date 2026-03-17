const logger = require('../config/logger');

// Custom error handling middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Log error
  logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;
