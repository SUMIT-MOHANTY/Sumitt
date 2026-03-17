import express from 'express';
import bookingService from '../services/bookingService';
import { authenticate } from '../middleware/authMiddleware';
import logger from '../utils/logger';

const router = express.Router();

// Create a new booking
router.post('/', authenticate, async (req, res) => {
  try {
    const { locationId, slotId, date } = req.body;
    const userId = req.user.id;

    if (!locationId || !slotId || !date) {
      return res.status(400).json({ error: 'Missing required booking information' });
    }

    const booking = await bookingService.createBooking({
      userId,
      locationId,
      slotId,
      date
    });

    return res.status(201).json(booking);
  } catch (error) {
    logger.error(`POST /bookings error: ${error}`);

    if (error.message.includes('slot is already booked')) {
      return res.status(409).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get all bookings for the current user
router.get('/my-bookings', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await bookingService.getUserBookings(userId);

    return res.status(200).json(bookings);
  } catch (error) {
    logger.error(`GET /bookings/my-bookings error: ${error}`);
    return res.status(500).json({ error: 'Failed to retrieve bookings' });
  }
});

// Cancel a booking
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    const booking = await bookingService.cancelBooking(bookingId, userId);

    return res.status(200).json(booking);
  } catch (error) {
    logger.error(`PUT /bookings/:id/cancel error: ${error}`);

    if (error.message.includes('Booking not found')) {
      return res.status(404).json({ error: error.message });
    }

    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

export default router;
