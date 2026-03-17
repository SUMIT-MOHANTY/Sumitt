const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Set mongoose options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
};

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/passport_booking_system';

    const conn = await mongoose.connect(MONGO_URI, options);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    // Exit with failure
    process.exit(1);
  }
};

module.exports = connectDB;
