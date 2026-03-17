/**
 * Main Server File
 */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');
const logger = require('./utils/logger');
const bookingRoutes = require('./routes/booking');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/bookings', bookingRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({
    success: false,
    message: 'Something went wrong',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
});

// Connect to MongoDB
mongoose.connect(config.mongodb.uri, config.mongodb.options)
  .then(() => {
    logger.info('Connected to MongoDB');

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      // Close server & exit process
      server.close(() => process.exit(1));
    });
  })
  .catch((err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  });
