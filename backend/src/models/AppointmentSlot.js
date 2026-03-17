/**
 * AppointmentSlot Model
 * Represents available time slots for scheduling appointments
 */
const mongoose = require('mongoose');
const { Schema } = mongoose;

const appointmentSlotSchema = new Schema({
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
    validate: {
      validator: function(v) {
        return v instanceof Date && !isNaN(v);
      },
      message: props => `${props.value} is not a valid date!`
    }
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
    validate: [
      {
        validator: function(v) {
          return v instanceof Date && !isNaN(v);
        },
        message: props => `${props.value} is not a valid date!`
      },
      {
        validator: function(v) {
          return this.startTime < v;
        },
        message: props => 'End time must be after start time!'
      }
    ]
  },
  location: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'Location is required']
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service is required']
  },
  staff: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Staff member is required']
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'blocked', 'cancelled'],
    default: 'available',
    required: true
  },
  appointment: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },
  capacity: {
    type: Number,
    default: 1,
    min: [1, 'Capacity must be at least 1'],
    max: [10, 'Capacity cannot exceed 10']
  },
  bookedCount: {
    type: Number,
    default: 0,
    min: [0, 'Booked count cannot be negative']
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly', null],
    default: null
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual field for duration in minutes
appointmentSlotSchema.virtual('durationMinutes').get(function() {
  try {
    const start = this.startTime.getTime();
    const end = this.endTime.getTime();
    return Math.round((end - start) / (1000 * 60));
  } catch (error) {
    console.error('Error calculating duration:', error);
    return 0;
  }
});

// Virtual field to check if slot is available
appointmentSlotSchema.virtual('isAvailable').get(function() {
  return this.status === 'available' && this.bookedCount < this.capacity;
});

// Pre-save middleware to update the updatedAt timestamp
appointmentSlotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Ensure bookedCount doesn't exceed capacity
  if (this.bookedCount > this.capacity) {
    this.bookedCount = this.capacity;
  }

  // Auto-update status based on bookedCount
  if (this.bookedCount >= this.capacity && this.status === 'available') {
    this.status = 'booked';
  } else if (this.bookedCount < this.capacity && this.status === 'booked') {
    this.status = 'available';
  }

  next();
});

// Method to check if a slot can be booked
appointmentSlotSchema.methods.canBook = function() {
  return this.status === 'available' && this.bookedCount < this.capacity;
};

// Method to book this slot
appointmentSlotSchema.methods.book = async function(appointmentId) {
  try {
    if (!this.canBook()) {
      throw new Error('This slot is not available for booking');
    }

    this.bookedCount += 1;
    this.appointment = appointmentId;

    if (this.bookedCount >= this.capacity) {
      this.status = 'booked';
    }

    await this.save();
    return true;
  } catch (error) {
    console.error('Error booking slot:', error);
    throw error;
  }
};

// Method to cancel a booking
appointmentSlotSchema.methods.cancelBooking = async function(appointmentId) {
  try {
    if (this.status !== 'booked' || !this.appointment ||
        this.appointment.toString() !== appointmentId.toString()) {
      throw new Error('Invalid appointment for this slot');
    }

    this.bookedCount = Math.max(0, this.bookedCount - 1);

    if (this.bookedCount < this.capacity) {
      this.status = 'available';
    }

    if (this.bookedCount === 0) {
      this.appointment = null;
    }

    await this.save();
    return true;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

// Static method to find available slots by date range and location
appointmentSlotSchema.statics.findAvailableSlots = async function(
  startDate,
  endDate,
  locationId,
  serviceId = null,
  staffId = null
) {
  try {
    const query = {
      startTime: { $gte: new Date(startDate) },
      endTime: { $lte: new Date(endDate) },
      status: 'available',
      bookedCount: { $lt: '$capacity' }
    };

    if (locationId) query.location = locationId;
    if (serviceId) query.service = serviceId;
    if (staffId) query.staff = staffId;

    return this.find(query)
      .populate('location', 'name address')
      .populate('service', 'name duration')
      .populate('staff', 'name')
      .sort({ startTime: 1 });
  } catch (error) {
    console.error('Error finding available slots:', error);
    return [];
  }
};

// Create indexes for better query performance
appointmentSlotSchema.index({ startTime: 1, endTime: 1 });
appointmentSlotSchema.index({ location: 1, service: 1, staff: 1 });
appointmentSlotSchema.index({ status: 1 });

const AppointmentSlot = mongoose.model('AppointmentSlot', appointmentSlotSchema);

module.exports = AppointmentSlot;
