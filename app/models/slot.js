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
    default: 1
  },
  booked: {
    type: Number,
    default: 0
  },
  location: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Virtual property to check if slot is available
SlotSchema.virtual('available').get(function() {
  return this.booked < this.capacity;
});

module.exports = mongoose.model('Slot', SlotSchema);
