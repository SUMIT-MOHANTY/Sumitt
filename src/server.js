const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');
const authRoutes = require('./auth/authRoutes');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Connect to MongoDB
mongoose
  .connect(config.mongoURI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
