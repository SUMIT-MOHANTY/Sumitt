/**
 * Booking.js - Booking model for the booking management system
 *
 * This model represents a booking in the system with all necessary fields
 * and validation rules.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Booking Schema Definition
 */
const bookingSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Booking date is required'],
    validate: {
      validator: function(date) {
        return date >= new Date(); // Ensure booking date is in the future
      },
      message: 'Booking date must be in the future'
    }
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:MM format']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:MM format']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Pre-save middleware to update the updatedAt field
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Instance methods for the Booking model
 */
bookingSchema.methods = {
  /**
   * Cancel the booking
   * @returns {Promise} Updated booking with cancelled status
   */
  cancel: async function() {
    this.status = 'cancelled';
    return this.save();
  },

  /**
   * Confirm the booking
   * @returns {Promise} Updated booking with confirmed status
   */
  confirm: async function() {
    this.status = 'confirmed';
    return this.save();
  }
};

/**
 * Static methods for the Booking model
 */
bookingSchema.statics = {
  /**
   * Get bookings for a specific user
   * @param {ObjectId} userId - User ID to filter bookings
   * @returns {Promise} List of bookings for the user
   */
  findByUser: function(userId) {
    return this.find({ userId }).sort({ date: 1, startTime: 1 });
  },

  /**
   * Check for booking conflicts
   * @param {ObjectId} serviceId - Service ID to check
   * @param {Date} date - Date to check
   * @param {String} startTime - Start time in HH:MM format
   * @param {String} endTime - End time in HH:MM format
   * @returns {Promise<boolean>} True if there's a conflict, false otherwise
   */
  async hasConflict(serviceId, date, startTime, endTime) {
    const dateStr = date.toISOString().split('T')[0];
    const overlappingBookings = await this.find({
      serviceId,
      date: {
        $gte: new Date(`${dateStr}T00:00:00.000Z`),
        $lte: new Date(`${dateStr}T23:59:59.999Z`)
      },
      status: { $nin: ['cancelled'] },
      $or: [
        // Requested booking starts during an existing booking
        {
          startTime: { $lte: startTime },
          endTime: { $gt: startTime }
        },
        // Requested booking ends during an existing booking
        {
          startTime: { $lt: endTime },
          endTime: { $gte: endTime }
        },
        // Requested booking completely contains an existing booking
        {
          startTime: { $gte: startTime },
          endTime: { $lte: endTime }
        }
      ]
    });

    return overlappingBookings.length > 0;
  }
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
