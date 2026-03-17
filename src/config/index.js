module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/appointment-system'
};
