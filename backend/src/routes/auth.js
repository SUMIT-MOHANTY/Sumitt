/**
 * Authentication routes for user login and registration
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const config = require('../config/auth.config');

// Mock user database for demonstration
// In a real application, this would be in a database
const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    // Default password: admin123
    password: '$2a$10$XsWAzMh8Wn6.VEn4LiQxlO2RSwXZ2Fc03IMF/jJeByO4bKZSBPPbK',
    roles: ['admin']
  },
  {
    id: 2,
    username: 'user',
    email: 'user@example.com',
    // Default password: user123
    password: '$2a$10$kIza/7JFmHJBG0C/ni/O2uKQoqvS7bkVG5JyGzFR4ypIrUz.VCn8W',
    roles: ['user']
  }
];

/**
 * @route POST /api/auth/login
 * @desc Authenticate user & get token
 * @access Public
 */
router.post('/login', [
  // Validation middleware
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { email, password } = req.body;

    // Find user by email
    const user = users.find(u => u.email === email);

    // Check if user exists
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create payload for JWT
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles
    };

    // Generate token
    jwt.sign(
      payload,
      config.secret,
      { expiresIn: config.expiresIn },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token: token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            roles: user.roles
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
