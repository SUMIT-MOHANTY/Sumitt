const express = require('express');
const router = express.Router();
const bookingRoutes = require('./booking.routes');

// Mount routes
router.use('/bookings', bookingRoutes);

module.exports = router;
