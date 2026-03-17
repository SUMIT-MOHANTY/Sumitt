const Booking = require('../models/booking');
const Slot = require('../models/slot');
const mongoose = require('mongoose');

class BookingService {
  /**
   * Check if a slot is available for booking
   * @param {string} slotId - ID of the slot to check
   * @returns {Promise<boolean>} - True if available, false otherwise
   */
  async isSlotAvailable(slotId) {
    const slot = await Slot.findById(slotId);
    if (!slot) {
      throw new Error('Slot not found');
    }
    return slot.booked < slot.capacity;
  }

  /**
   * Check if user already has a booking for this slot
   * @param {string} userId - User ID
   * @param {string} slotId - Slot ID
   * @returns {Promise<boolean>} - True if exists, false otherwise
   */
  async hasExistingBooking(userId, slotId) {
    const booking = await Booking.findOne({ userId, slotId });
    return !!booking;
  }

  /**
   * Create a booking for a user
   * @param {string} userId - ID of the user making the booking
   * @param {string} slotId - ID of the slot to book
   * @returns {Promise<Object>} - Created booking object
   */
  async createBooking(userId, slotId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if slot exists and is available
      const slot = await Slot.findById(slotId).session(session);
      if (!slot) {
        throw new Error('Slot not found');
      }

      if (slot.booked >= slot.capacity) {
        throw new Error('Slot is no longer available');
      }

      // Check for duplicate booking
      const existingBooking = await Booking.findOne({ userId, slotId }).session(session);
      if (existingBooking) {
        throw new Error('You already have a booking for this slot');
      }

      // Create booking
      const booking = await Booking.create([{
        userId,
        slotId,
        status: 'confirmed'
      }], { session });

      // Update slot booking count
      slot.booked += 1;
      if (slot.booked >= slot.capacity) {
        slot.isAvailable = false;
      }
      await slot.save({ session });

      await session.commitTransaction();
      return booking[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get a user's bookings
   * @param {string} userId - ID of the user
   * @returns {Promise<Array>} - List of user's bookings
   */
  async getUserBookings(userId) {
    return await Booking.find({ userId })
      .populate('slotId')
      .sort({ bookingDate: -1 });
  }
}

module.exports = new BookingService();
