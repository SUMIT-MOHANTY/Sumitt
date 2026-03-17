/**
 * Application configuration
 */
require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment-app',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || 'user@example.com',
    password: process.env.EMAIL_PASSWORD || 'password',
    from: process.env.EMAIL_FROM || 'appointments@example.com'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  }
};

module.exports = config;
