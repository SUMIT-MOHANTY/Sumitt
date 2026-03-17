const dotenv = require('dotenv');
const path = require('path');
const logger = require('../utils/logger');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Fallback configuration values
const defaultConfig = {
  PORT: 3000,
  JWT_SECRET: 'default_jwt_secret_change_in_production',
  JWT_EXPIRY: '1d',
  SALT_ROUNDS: 10,
  NODE_ENV: 'development'
};

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'SALT_ROUNDS'];

const validateEnv = () => {
  let missingVars = [];

  requiredEnvVars.forEach(variable => {
    if (!process.env[variable]) {
      missingVars.push(variable);
    }
  });

  if (missingVars.length > 0) {
    logger.warn(`Missing environment variables: ${missingVars.join(', ')}. Using defaults for now.`);
  }
};

// Export config with fallbacks to default values
const config = {
  PORT: process.env.PORT || defaultConfig.PORT,
  JWT_SECRET: process.env.JWT_SECRET || defaultConfig.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || defaultConfig.JWT_EXPIRY,
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS || defaultConfig.SALT_ROUNDS, 10),
  NODE_ENV: process.env.NODE_ENV || defaultConfig.NODE_ENV
};

validateEnv();

module.exports = config;
