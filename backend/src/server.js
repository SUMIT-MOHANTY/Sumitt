/**
 * Server startup file
 */
const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Admin bookings endpoint available at: http://localhost:${PORT}/api/admin/bookings`);
});
