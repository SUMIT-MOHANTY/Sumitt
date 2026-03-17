const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const config = require('../config/config');
const logger = require('../utils/logger');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRegistration, async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`Registration attempt with existing email: ${email}`);
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate verification token
    const verificationToken = Math.random().toString(36).substring(2, 15) +
                             Math.random().toString(36).substring(2, 15);

    // Create new user
    const newUser = new User({
      email,
      password, // Will be hashed by pre-save hook
      firstName,
      lastName,
      verificationToken
    });

    // Save user to database
    await newUser.save();

    logger.info(`New user registered: ${email}`);

    // TODO: Send verification email with token
    // This would be implemented with an email service

    // Return success without sensitive information
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      }
    });

  } catch (error) {
    logger.error(`Error during user registration: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', validateLogin, async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Validate password
    const isMatch = await user.isValidPassword(password);

    if (!isMatch) {
      logger.warn(`Failed login attempt for user: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      logger.warn(`Login attempt for unverified user: ${email}`);
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRY }
    );

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });

  } catch (error) {
    logger.error(`Error during user login: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
