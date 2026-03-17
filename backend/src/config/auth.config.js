/**
 * Authentication configuration
 */
module.exports = {
  secret: process.env.JWT_SECRET || "passport-booking-secure-jwt-secret-key",
  expiresIn: '24h' // Token expiration time
};
