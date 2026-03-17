const { body, validationResult } = require('express-validator');
const { logger } = require('../utils/logger');

// User registration validation
exports.validateRegistration = [
  body('name')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot be more than 50 characters'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      logger.warn(`Validation error during registration: ${JSON.stringify(errors.array())}`);

      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    next();
  }
];
