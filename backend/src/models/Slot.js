const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  booked: {
    type: Number,
    default: 0
  },
  available: {
    type: Boolean,
    default: true
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual property to calculate remaining slots
SlotSchema.virtual('remaining').get(function() {
  return this.capacity - this.booked;
});

// Pre-save middleware to check if the slot is available
SlotSchema.pre('save', function(next) {
  this.available = this.booked < this.capacity;
  this.updatedAt = Date.now();
  next();
});

// Create the Slot model
const Slot = mongoose.model('Slot', SlotSchema);

module.exports = Slot;
