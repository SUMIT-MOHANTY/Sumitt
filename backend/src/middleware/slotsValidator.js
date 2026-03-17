const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Validation rules for creating slots
 */
const createSlotRules = [
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be in ISO 8601 format (YYYY-MM-DD)'),

  body('startTime')
    .notEmpty().withMessage('Start time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),

  body('endTime')
    .notEmpty().withMessage('End time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format')
    .custom((value, { req }) => {
      // Make sure end time is after start time
      const startTime = req.body.startTime;
      if (startTime && value <= startTime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),

  body('capacity')
    .optional()
    .isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),

  body('available')
    .optional()
    .isBoolean().withMessage('Available must be true or false'),

  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number')
];

/**
 * Middleware to validate slot requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateSlot = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(`Slot validation failed: ${JSON.stringify(errors.array())}`);
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  createSlotRules,
  validateSlot
};
