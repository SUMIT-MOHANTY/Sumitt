const { initializeDatabase, testConnection, closeConnection } = require('../../src/database');
const { logger } = require('../../src/utils/logger');

// Silence logger during tests
logger.silent = true;

describe('Database Connection', () => {
  afterAll(async () => {
    await closeConnection();
  });

  test('should initialize database', () => {
    const db = initializeDatabase();
    expect(db).toBeDefined();
    expect(typeof db.raw).toBe('function');
  });

  test('should test connection successfully', async () => {
    const result = await testConnection();
    expect(result).toBe(true);
  });
});
