const bookingService = require('../services/booking.service');

class BookingController {
  /**
   * Create a new booking
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createBooking(req, res) {
    try {
      const { slotId } = req.body;
      const userId = req.user.id; // Assuming user is attached by auth middleware

      // Check if slot is available
      const isAvailable = await bookingService.isSlotAvailable(slotId);
      if (!isAvailable) {
        return res.status(400).json({ message: 'The selected slot is no longer available' });
      }

      // Check for duplicate booking
      const hasBooking = await bookingService.hasExistingBooking(userId, slotId);
      if (hasBooking) {
        return res.status(400).json({ message: 'You already have a booking for this slot' });
      }

      // Create booking
      const booking = await bookingService.createBooking(userId, slotId);

      return res.status(201).json({
        success: true,
        data: booking,
        message: 'Booking confirmed successfully'
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while creating your booking'
      });
    }
  }

  /**
   * Get user bookings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserBookings(req, res) {
    try {
      const userId = req.user.id;
      const bookings = await bookingService.getUserBookings(userId);

      return res.status(200).json({
        success: true,
        data: bookings
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while fetching your bookings'
      });
    }
  }
}

module.exports = new BookingController();
