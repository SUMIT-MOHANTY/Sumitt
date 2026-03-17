const path = require('path');
const fs = require('fs');

// Load environment variables from .env file if not in production
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config();
  } catch (error) {
    console.warn('dotenv package not found, skipping .env loading');
  }
}

// Database configuration with defaults and environment variable fallbacks
const config = {
  development: {
    client: process.env.DB_CLIENT || 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'appointment_booking_dev',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    },
    migrations: {
      directory: path.join(__dirname, '../../migrations')
    },
    seeds: {
      directory: path.join(__dirname, '../../seeds')
    },
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      max: parseInt(process.env.DB_POOL_MAX || '10', 10)
    }
  },
  test: {
    client: process.env.TEST_DB_CLIENT || 'postgresql',
    connection: {
      host: process.env.TEST_DB_HOST || 'localhost',
      port: parseInt(process.env.TEST_DB_PORT || '5432', 10),
      database: process.env.TEST_DB_NAME || 'appointment_booking_test',
      user: process.env.TEST_DB_USER || 'postgres',
      password: process.env.TEST_DB_PASSWORD || 'postgres',
    },
    migrations: {
      directory: path.join(__dirname, '../../migrations')
    },
    seeds: {
      directory: path.join(__dirname, '../../seeds')
    }
  },
  production: {
    client: process.env.DB_CLIENT || 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    },
    migrations: {
      directory: path.join(__dirname, '../../migrations')
    },
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      max: parseInt(process.env.DB_POOL_MAX || '10', 10)
    }
  }
};

// Get current environment or default to development
const environment = process.env.NODE_ENV || 'development';

// Validate configuration before exporting
if (!config[environment]) {
  throw new Error(`Invalid environment: ${environment}`);
}

module.exports = config;
