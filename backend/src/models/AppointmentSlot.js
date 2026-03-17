/**
 * AppointmentSlot Model
 * Represents available time slots at specific locations for passport appointments
 */

const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');
const Location = require('./Location');

class AppointmentSlot extends Model {
  /**
   * Check if the slot has available capacity
   * @returns {Promise<boolean>} - True if slot has capacity, false otherwise
   */
  async hasAvailableCapacity() {
    try {
      const bookingsCount = await sequelize.models.Booking.count({
        where: {
          slot_id: this.id
        }
      });

      return bookingsCount < this.max_bookings;
    } catch (error) {
      logger.error(`Error checking slot capacity for slot ${this.id}: ${error.message}`);
      throw new Error(`Failed to check slot capacity: ${error.message}`);
    }
  }

  /**
   * Get remaining capacity for this slot
   * @returns {Promise<number>} - Number of available bookings
   */
  async getRemainingCapacity() {
    try {
      const bookingsCount = await sequelize.models.Booking.count({
        where: {
          slot_id: this.id
        }
      });

      return this.max_bookings - bookingsCount;
    } catch (error) {
      logger.error(`Error getting remaining capacity for slot ${this.id}: ${error.message}`);
      throw new Error(`Failed to get remaining capacity: ${error.message}`);
    }
  }

  /**
   * Find available slots for a specific date range and location
   * @param {number} locationId - Location ID
   * @param {Date} startDate - Start date for the search
   * @param {Date} endDate - End date for the search
   * @returns {Promise<Array>} - Array of available appointment slots
   */
  static async findAvailableSlots(locationId, startDate = new Date(), endDate = null) {
    try {
      if (!endDate) {
        // Default to 30 days from startDate
        endDate = new Date();
        endDate.setDate(startDate.getDate() + 30);
      }

      // Format dates for database query
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      // Get all slots for the location in the date range
      const slots = await AppointmentSlot.findAll({
        where: {
          location_id: locationId,
          date: {
            [sequelize.Sequelize.Op.between]: [formattedStartDate, formattedEndDate]
          }
        },
        include: [
          {
            model: Location,
            attributes: ['name', 'address']
          }
        ]
      });

      // Enhance slots with availability information
      const enhancedSlots = await Promise.all(
        slots.map(async (slot) => {
          const remainingCapacity = await slot.getRemainingCapacity();
          return {
            ...slot.toJSON(),
            available_bookings: remainingCapacity,
            is_available: remainingCapacity > 0
          };
        })
      );

      // Filter only available slots
      return enhancedSlots.filter(slot => slot.is_available);
    } catch (error) {
      logger.error(`Error finding available slots: ${error.message}`);
      throw new Error(`Failed to find available slots: ${error.message}`);
    }
  }
}

AppointmentSlot.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    location_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'locations',
        key: 'id'
      },
      validate: {
        isInt: {
          msg: 'Location ID must be an integer'
        }
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: {
          msg: 'Invalid date format'
        },
        isNotPast(value) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const slotDate = new Date(value);

          if (slotDate < today) {
            throw new Error('Appointment date cannot be in the past');
          }
        }
      }
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        isLaterThanStartTime(value) {
          if (this.start_time >= value) {
            throw new Error('End time must be later than start time');
          }
        }
      }
    },
    max_bookings: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        isInt: {
          msg: 'Max bookings must be an integer'
        },
        min: {
          args: [1],
          msg: 'Max bookings must be at least 1'
        },
        async notExceedLocationCapacity(value) {
          try {
            const location = await Location.findByPk(this.location_id);
            if (!location) {
              throw new Error('Location not found');
            }

            if (value > location.capacity) {
              throw new Error(`Max bookings cannot exceed location capacity of ${location.capacity}`);
            }
          } catch (error) {
            throw new Error(`Validation error: ${error.message}`);
          }
        }
      }
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'AppointmentSlot',
    tableName: 'appointment_slots',
    timestamps: false,
    underscored: true,
    hooks: {
      beforeValidate: async (slot) => {
        // Additional validation could be added here
      },
      afterCreate: async (slot) => {
        logger.info(`New appointment slot created: ID ${slot.id} at location ${slot.location_id} for ${slot.date}`);
      }
    }
  }
);

// Define relationships
AppointmentSlot.belongsTo(Location, { foreignKey: 'location_id' });
Location.hasMany(AppointmentSlot, { foreignKey: 'location_id' });

/**
 * Seed sample appointment slots for the next 30 days
 * @returns {Promise<Array>} - Array of created appointment slots
 */
AppointmentSlot.seedSampleData = async () => {
  try {
    logger.info('Seeding sample appointment slots...');

    // Check if data already exists
    const count = await AppointmentSlot.count();
    if (count > 0) {
      logger.info(`Appointment slots already seeded (${count} records found). Skipping.`);
      return await AppointmentSlot.findAll();
    }

    // Get all locations
    const locations = await Location.findAll();
    if (locations.length === 0) {
      logger.info('No locations found. Please seed locations first.');
      return [];
    }

    const slots = [];
    const today = new Date();

    // Create slots for the next 30 days
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const formattedDate = date.toISOString().split('T')[0];

      // For each location, create morning and afternoon slots
      for (const location of locations) {
        // Morning slot: 9:00 AM - 12:00 PM
        slots.push({
          location_id: location.id,
          date: formattedDate,
          start_time: '09:00:00',
          end_time: '12:00:00',
          max_bookings: Math.floor(location.capacity / 2)
        });

        // Afternoon slot: 1:00 PM - 4:00 PM
        slots.push({
          location_id: location.id,
          date: formattedDate,
          start_time: '13:00:00',
          end_time: '16:00:00',
          max_bookings: Math.floor(location.capacity / 2)
        });
      }
    }

    const createdSlots = await AppointmentSlot.bulkCreate(slots);
    logger.info(`Created ${createdSlots.length} sample appointment slots`);
    return createdSlots;
  } catch (error) {
    logger.error(`Error seeding appointment slots: ${error.message}`);
    throw new Error(`Failed to seed appointment slots: ${error.message}`);
  }
};

module.exports = AppointmentSlot;
