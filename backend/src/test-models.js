/**
 * Test script for Location and AppointmentSlot models
 * Run with: node test-models.js
 */

const { sequelize } = require('./config/database');
const { Location, AppointmentSlot } = require('./models');
const logger = require('./utils/logger');

async function testModels() {
  try {
    logger.info('Testing database connection...');
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // Sync models with database
    logger.info('Syncing models with database...');
    await sequelize.sync({ force: true });
    logger.info('Models synchronized successfully.');

    // Seed sample data
    logger.info('Seeding sample data...');
    const locations = await Location.seedSampleData();
    logger.info(`Created ${locations.length} sample locations.`);

    const slots = await AppointmentSlot.seedSampleData();
    logger.info(`Created ${slots.length} sample appointment slots.`);

    // Test model methods
    logger.info('Testing model methods...');

    // Get locations with capacity
    const locationsWithCapacity = await Location.getAllWithCapacity();
    logger.info(`Found ${locationsWithCapacity.length} locations with capacity information.`);

    // Get available slots for the first location
    const firstLocation = locations[0];
    const availableSlots = await firstLocation.getAvailableSlots();
    logger.info(`Location "${firstLocation.name}" has ${availableSlots.length} available slots.`);

    // Find available slots for a specific date range and location
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const slotsForDateRange = await AppointmentSlot.findAvailableSlots(firstLocation.id, today, nextWeek);
    logger.info(`Found ${slotsForDateRange.length} available slots for location "${firstLocation.name}" in the next week.`);

    logger.info('All tests completed successfully.');

    process.exit(0);
  } catch (error) {
    logger.error(`Error testing models: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
testModels();
