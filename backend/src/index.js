const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('./config/logger');
const errorHandler = require('./middleware/error');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/slots', require('./routes/slots'));

// Add more routes as needed
// app.use('/api/bookings', require('./routes/bookings'));
// app.use('/api/users', require('./routes/users'));

// Error handling middleware
app.use(errorHandler);

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Passport Booking System API' });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/passport-booking', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    logger.info('MongoDB Connected');
  })
  .catch((err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
