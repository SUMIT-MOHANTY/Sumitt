/**
 * This is an example of how to use the auth middleware in a protected route
 * This file is for reference only and not required for the actual implementation
 */
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Protected route example
router.get('/profile', auth, async (req, res) => {
  try {
    // req.user was added by the auth middleware
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
