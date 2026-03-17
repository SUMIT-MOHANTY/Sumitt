const express = require('express');
const router = express.Router();
const { register } = require('../controllers/authController');
const { validateRegistration } = require('../middleware/validation');

// POST /api/auth/register - Register a user
router.post('/register', validateRegistration, register);

module.exports = router;
