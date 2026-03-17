/**
 * Location Model
 * Represents a physical location where passport appointments can be booked
 */

const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

class Location extends Model {
  /**
   * Get all available appointment slots for this location
   * @param {Date} startDate - Starting date for available slots (defaults to today)
   * @param {Date} endDate - End date for available slots (defaults to 30 days from today)
   * @returns {Promise<Array>} - Array of available appointment slots
   */
  async getAvailableSlots(startDate = new Date(), endDate = null) {
    try {
      if (!endDate) {
        // Default to 30 days from startDate
        endDate = new Date();
        endDate.setDate(startDate.getDate() + 30);
      }

      const { AppointmentSlot } = require('./AppointmentSlot');

      // Find all slots for this location within date range that have capacity
      const slots = await AppointmentSlot.findAll({
        where: {
          location_id: this.id,
          date: {
            [sequelize.Sequelize.Op.between]: [startDate, endDate]
          }
        },
        include: [
          {
            model: sequelize.models.Booking,
            attributes: ['id']
          }
        ]
      });

      // Filter slots that have available capacity
      return slots.filter(slot => {
        return slot.Bookings.length < slot.max_bookings;
      });
    } catch (error) {
      logger.error(`Error getting available slots for location ${this.id}: ${error.message}`);
      throw new Error(`Failed to get available slots: ${error.message}`);
    }
  }

  /**
   * Get locations with capacity info
   * @returns {Promise<Array>} - Array of locations with capacity information
   */
  static async getAllWithCapacity() {
    try {
      const locations = await Location.findAll();

      // Enhance locations with capacity info
      const locationsWithCapacity = await Promise.all(
        locations.map(async location => {
          const availableSlots = await location.getAvailableSlots();
          return {
            ...location.toJSON(),
            available_slots_count: availableSlots.length
          };
        })
      );

      return locationsWithCapacity;
    } catch (error) {
      logger.error(`Error getting locations with capacity: ${error.message}`);
      throw new Error(`Failed to get locations with capacity: ${error.message}`);
    }
  }
}

Location.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Location name cannot be empty'
        }
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Location address cannot be empty'
        }
      }
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: 'Capacity must be an integer'
        },
        min: {
          args: [1],
          msg: 'Capacity must be at least 1'
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
    modelName: 'Location',
    tableName: 'locations',
    timestamps: false,
    underscored: true
  }
);

/**
 * Seed sample locations
 * @returns {Promise<Array>} - Array of created locations
 */
Location.seedSampleData = async () => {
  try {
    logger.info('Seeding sample locations...');
    const sampleLocations = [
      { name: 'Downtown Passport Office', address: '123 Main St, City Center', capacity: 50 },
      { name: 'Westside Passport Center', address: '456 West Ave, Westside', capacity: 30 },
      { name: 'Eastside Government Building', address: '789 East Blvd, Eastside', capacity: 40 },
      { name: 'Northside Service Center', address: '101 North Rd, Northside', capacity: 25 },
      { name: 'Southside Municipal Office', address: '202 South St, Southside', capacity: 35 }
    ];

    // Check if data already exists
    const count = await Location.count();
    if (count > 0) {
      logger.info(`Locations already seeded (${count} records found). Skipping.`);
      return await Location.findAll();
    }

    const createdLocations = await Location.bulkCreate(sampleLocations);
    logger.info(`Created ${createdLocations.length} sample locations`);
    return createdLocations;
  } catch (error) {
    logger.error(`Error seeding locations: ${error.message}`);
    throw new Error(`Failed to seed locations: ${error.message}`);
  }
};

module.exports = Location;
