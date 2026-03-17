const express = require('express');
const dotenv = require('dotenv');
const { connectDB } = require('./src/config/db');
const { logger } = require('./src/utils/logger');
const authRoutes = require('./src/routes/auth');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Error handler
app.use((err, req, res, next) => {
  logger.error(`${err.name}: ${err.message}`);

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

// Connect to database
connectDB();

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
