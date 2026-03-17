const { db } = require('../database');
const Booking = require('../models/Booking');
const { logger } = require('../utils/logger');

class BookingRepository {
  constructor() {
    this.tableName = 'bookings';
  }

  /**
   * Find booking by ID
   * @param {string} id Booking ID
   * @returns {Promise<Booking|null>} Booking instance or null if not found
   */
  async findById(id) {
    try {
      if (!id) throw new Error('Booking ID is required');

      const result = await db(this.tableName)
        .where({ id })
        .first();

      return result ? new Booking(result) : null;
    } catch (error) {
      logger.error(`BookingRepository.findById error: ${error.message}`, { id });
      throw new Error(`Failed to find booking: ${error.message}`);
    }
  }

  /**
   * Find all bookings for a user
   * @param {string} userId User ID
   * @returns {Promise<Booking[]>} Array of bookings
   */
  async findByUserId(userId) {
    try {
      if (!userId) throw new Error('User ID is required');

      const results = await db(this.tableName)
        .where({ user_id: userId })
        .orderBy('booking_date', 'desc');

      return results.map(result => new Booking(result));
    } catch (error) {
      logger.error(`BookingRepository.findByUserId error: ${error.message}`, { userId });
      throw new Error(`Failed to find bookings for user: ${error.message}`);
    }
  }

  /**
   * Check if a slot is already booked
   * @param {string} slotId Slot ID
   * @param {Date} date Booking date
   * @returns {Promise<boolean>} True if slot is already booked
   */
  async isSlotBooked(slotId, date) {
    try {
      if (!slotId) throw new Error('Slot ID is required');

      const result = await db(this.tableName)
        .where({
          slot_id: slotId,
          booking_date: date
        })
        .whereNot({ status: 'cancelled' })
        .first();

      return !!result;
    } catch (error) {
      logger.error(`BookingRepository.isSlotBooked error: ${error.message}`, { slotId, date });
      throw new Error(`Failed to check if slot is booked: ${error.message}`);
    }
  }

  /**
   * Create a new booking
   * @param {Booking} booking Booking instance
   * @returns {Promise<Booking>} Created booking
   */
  async create(booking) {
    try {
      if (!(booking instanceof Booking)) {
        throw new Error('Invalid booking object');
      }

      const isBooked = await this.isSlotBooked(booking.slotId, booking.bookingDate);
      if (isBooked) {
        throw new Error('This slot is already booked');
      }

      const [result] = await db(this.tableName)
        .insert(booking.toDatabase())
        .returning('*');

      logger.info(`Created new booking with ID: ${result.id}`);
      return new Booking(result);
    } catch (error) {
      logger.error(`BookingRepository.create error: ${error.message}`, { booking });
      throw new Error(`Failed to create booking: ${error.message}`);
    }
  }

  /**
   * Update a booking
   * @param {string} id Booking ID
   * @param {Object} data Booking data to update
   * @returns {Promise<Booking>} Updated booking
   */
  async update(id, data) {
    try {
      if (!id) throw new Error('Booking ID is required');

      const booking = await this.findById(id);
      if (!booking) {
        throw new Error(`Booking not found with ID: ${id}`);
      }

      // Update booking properties
      Object.assign(booking, data);
      booking.validate();

      const [result] = await db(this.tableName)
        .where({ id })
        .update(booking.toDatabase())
        .returning('*');

      logger.info(`Updated booking with ID: ${result.id}`);
      return new Booking(result);
    } catch (error) {
      logger.error(`BookingRepository.update error: ${error.message}`, { id, data });
      throw new Error(`Failed to update booking: ${error.message}`);
    }
  }

  /**
   * Delete a booking
   * @param {string} id Booking ID
   * @returns {Promise<boolean>} True if booking was deleted
   */
  async delete(id) {
    try {
      if (!id) throw new Error('Booking ID is required');

      const result = await db(this.tableName)
        .where({ id })
        .delete();

      logger.info(`Deleted booking with ID: ${id}`);
      return result > 0;
    } catch (error) {
      logger.error(`BookingRepository.delete error: ${error.message}`, { id });
      throw new Error(`Failed to delete booking: ${error.message}`);
    }
  }
}

module.exports = new BookingRepository();
