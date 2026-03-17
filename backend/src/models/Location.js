/**
 * Location Model
 * Represents a physical location where appointments can be scheduled
 */
const mongoose = require('mongoose');
const { Schema } = mongoose;

const locationSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true,
    maxlength: [100, 'Location name cannot exceed 100 characters']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required'],
      trim: true,
      validate: {
        validator: function(v) {
          // Basic US zip code validation (5 digits or ZIP+4 format)
          return /^\d{5}(-\d{4})?$/.test(v);
        },
        message: props => `${props.value} is not a valid zip code!`
      }
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      default: 'USA'
    }
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        // Basic phone validation
        return /^\d{10}$|^\d{3}-\d{3}-\d{4}$|^\(\d{3}\)\s?\d{3}-\d{4}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        // Basic email validation
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  operatingHours: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    openTime: {
      type: String,
      required: true,
      // Time in 24-hour format (HH:MM)
      validate: {
        validator: function(v) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: props => `${props.value} is not a valid time format (HH:MM)!`
      }
    },
    closeTime: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: props => `${props.value} is not a valid time format (HH:MM)!`
      }
    },
    isClosed: {
      type: Boolean,
      default: false
    }
  }],
  services: [{
    type: Schema.Types.ObjectId,
    ref: 'Service'
  }],
  staff: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  maxDailyAppointments: {
    type: Number,
    default: 50,
    min: [1, 'Must allow at least 1 appointment per day'],
    max: [500, 'Cannot exceed 500 appointments per day']
  },
  notes: {
    type: String,
    trim: true
  },
  timezone: {
    type: String,
    default: 'America/New_York',
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
}, {
  timestamps: true
});

// Virtual field to get the full address
locationSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}`;
});

// Pre-save middleware to update the updatedAt timestamp
locationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if location is open on a specific date and time
locationSchema.methods.isOpenAt = function(dateTime) {
  try {
    if (!dateTime) return false;

    const date = new Date(dateTime);
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    const daySchedule = this.operatingHours.find(h => h.day === dayOfWeek);

    if (!daySchedule || daySchedule.isClosed) {
      return false;
    }

    return timeString >= daySchedule.openTime && timeString <= daySchedule.closeTime;
  } catch (error) {
    console.error('Error checking if location is open:', error);
    return false;
  }
};

// Static method to find nearby locations by zipcode
locationSchema.statics.findByZipCode = async function(zipCode, radiusMiles = 10) {
  try {
    // This is a simplified version - in a real implementation you would use geospatial queries
    // if the database supports them (like MongoDB)
    return this.find({ 'address.zipCode': zipCode });
  } catch (error) {
    console.error('Error finding locations by zip code:', error);
    return [];
  }
};

// Create index for better performance on queries
locationSchema.index({ 'address.zipCode': 1 });
locationSchema.index({ isActive: 1 });

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
