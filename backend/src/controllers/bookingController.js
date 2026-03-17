/**
 * Booking Controller
 */
const Booking = require('../models/booking');
const User = require('../models/user');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

class BookingController {
  /**
   * Create a new booking
   */
  async createBooking(req, res) {
    try {
      const { locationId, slotId, date, time, userId } = req.body;

      // Validate required fields
      if (!locationId || !slotId || !date || !time || !userId) {
        logger.warn('Missing required booking fields', { body: req.body });
        return res.status(400).json({
          success: false,
          message: 'All fields are required: locationId, slotId, date, time, userId'
        });
      }

      // Create booking
      const booking = new Booking({
        location: locationId,
        slot: slotId,
        date,
        time,
        user: userId,
        status: 'confirmed'
      });

      // Save booking
      const savedBooking = await booking.save();
      logger.info(`Booking created successfully: ${savedBooking._id}`);

      // Fetch user and location details for the email
      const user = await User.findById(userId);

      // Populate location details
      const populatedBooking = await Booking.findById(savedBooking._id)
        .populate('location')
        .exec();

      if (!user) {
        logger.error(`User not found: ${userId}`);
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Send confirmation email
      try {
        await emailService.sendAppointmentConfirmation(
          {
            location: populatedBooking.location,
            date: populatedBooking.date,
            time: populatedBooking.time
          },
          user
        );
        logger.info(`Confirmation email sent to ${user.email}`);
      } catch (emailError) {
        logger.error(`Failed to send confirmation email: ${emailError.message}`);
        // We don't want to fail the booking if email fails
      }

      return res.status(201).json({
        success: true,
        data: savedBooking,
        message: 'Booking created successfully and confirmation email sent'
      });
    } catch (error) {
      logger.error(`Booking creation failed: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to create booking',
        error: error.message
      });
    }
  }

  // Other booking methods would go here
}

module.exports = new BookingController();
