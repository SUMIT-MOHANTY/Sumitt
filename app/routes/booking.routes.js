const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply authentication middleware to all booking routes
router.use(authMiddleware.authenticate);

// Create a new booking
router.post('/', bookingController.createBooking);

// Get user's bookings
router.get('/my-bookings', bookingController.getUserBookings);

module.exports = router;
