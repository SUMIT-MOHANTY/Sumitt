const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn()
}));

// Import server after mocking dependencies
const app = require('../../../server');

describe('Admin Slots API', () => {
  let adminToken;
  let nonAdminToken;

  beforeAll(() => {
    // Create test tokens
    adminToken = jwt.sign(
      { id: 'admin123', isAdmin: true },
      process.env.JWT_SECRET || 'fallback_secret_for_dev'
    );

    nonAdminToken = jwt.sign(
      { id: 'user456', isAdmin: false },
      process.env.JWT_SECRET || 'fallback_secret_for_dev'
    );
  });

  describe('POST /api/admin/slots', () => {
    test('Should create a new slot when admin is authenticated', async () => {
      const slotData = {
        date: '2023-05-15',
        startTime: '09:00',
        endTime: '10:00',
        capacity: 3,
        price: 25.99
      };

      const response = await request(app)
        .post('/api/admin/slots')
        .set('x-auth-token', adminToken)
        .send(slotData);

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.date).toBe(slotData.date);
      expect(response.body.data.startTime).toBe(slotData.startTime);
    });

    test('Should not allow non-admin users to create slots', async () => {
      const slotData = {
        date: '2023-05-15',
        startTime: '14:00',
        endTime: '15:00'
      };

      const response = await request(app)
        .post('/api/admin/slots')
        .set('x-auth-token', nonAdminToken)
        .send(slotData);

      expect(response.statusCode).toBe(403);
    });

    test('Should reject invalid slot data', async () => {
      const invalidSlotData = {
        // Missing required fields
        capacity: 5
      };

      const response = await request(app)
        .post('/api/admin/slots')
        .set('x-auth-token', adminToken)
        .send(invalidSlotData);

      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });
});
