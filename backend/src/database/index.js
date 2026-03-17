const knex = require('knex');
const config = require('../config/database');
const { logger } = require('../utils/logger');

// Get current environment
const environment = process.env.NODE_ENV || 'development';

// Initialize database connection
let db;
let connected = false;

/**
 * Initialize the database connection
 * @returns {Object} Knex database instance
 */
function initializeDatabase() {
  try {
    if (!db) {
      logger.info(`Initializing database connection for environment: ${environment}`);
      db = knex(config[environment]);

      // Add error handler to connection
      db.on('error', (error) => {
        connected = false;
        logger.error(`Database connection error: ${error.message}`);
      });
    }

    return db;
  } catch (error) {
    logger.error(`Failed to initialize database: ${error.message}`);
    throw new Error(`Database initialization failed: ${error.message}`);
  }
}

/**
 * Tests the database connection
 * @returns {Promise<boolean>} True if connection is successful
 */
async function testConnection() {
  try {
    const database = initializeDatabase();
    await database.raw('SELECT 1');
    connected = true;
    logger.info('Database connection test successful');
    return true;
  } catch (error) {
    connected = false;
    logger.error(`Database connection test failed: ${error.message}`);
    return false;
  }
}

/**
 * Closes the database connection
 * @returns {Promise<void>}
 */
async function closeConnection() {
  try {
    if (db) {
      await db.destroy();
      db = null;
      connected = false;
      logger.info('Database connection closed');
    }
  } catch (error) {
    logger.error(`Error closing database connection: ${error.message}`);
    throw new Error(`Failed to close database connection: ${error.message}`);
  }
}

/**
 * Get the database connection status
 * @returns {boolean} True if connected
 */
function isConnected() {
  return connected;
}

module.exports = {
  db: initializeDatabase(),
  initializeDatabase,
  testConnection,
  closeConnection,
  isConnected
};
