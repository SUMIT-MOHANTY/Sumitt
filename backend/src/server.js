const mongoose = require('mongoose');
const app = require('./app');
const logger = require('./utils/logger');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/passport_booking_system';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('MongoDB connected successfully');
  // Start the server
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
})
.catch(err => {
  logger.error(`MongoDB connection error: ${err.message}`);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application will continue running
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Exit with failure
  process.exit(1);
});
