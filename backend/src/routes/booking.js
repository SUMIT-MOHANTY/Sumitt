/**
 * Booking Routes
 */
const express = require('express');
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a new booking
router.post('/', auth, bookingController.createBooking);

module.exports = router;
