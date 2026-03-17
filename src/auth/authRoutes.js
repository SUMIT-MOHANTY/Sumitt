const express = require('express');
const { check } = require('express-validator');
const authController = require('./authController');

const router = express.Router();

// Registration route with validation
router.post(
  '/register',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 8 characters long').isLength({ min: 8 })
  ],
  authController.register
);

module.exports = router;
