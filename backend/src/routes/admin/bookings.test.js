/**
 * Tests for Admin Bookings API Endpoints
 */
const request = require('supertest');
const express = require('express');
const bookingsRouter = require('./bookings');

// Mock dependencies
jest.mock('../../middleware/adminAuth', () => {
  return (req, res, next) => {
    req.user = { id: 'admin-user-123', isAdmin: true };
    next();
  };
});

// Setup test app
const app = express();
app.use(express.json());
app.use('/api/admin/bookings', bookingsRouter);

describe('Admin Bookings API', () => {
  describe('GET /api/admin/bookings', () => {
    it('should return paginated bookings with 200 status', async () => {
      const response = await request(app).get('/api/admin/bookings');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data.bookings)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should handle query parameters correctly', async () => {
      const response = await request(app)
        .get('/api/admin/bookings')
        .query({ page: 2, limit: 5, status: 'confirmed' });

      expect(response.status).toBe(200);
      expect(response.body.data.pagination.page).toBe(2);
      expect(response.body.data.pagination.limit).toBe(5);
    });

    it('should validate query parameters and return 400 for invalid inputs', async () => {
      const response = await request(app)
        .get('/api/admin/bookings')
        .query({ page: 'invalid', limit: -5 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/admin/bookings/stats', () => {
    it('should return booking statistics with 200 status', async () => {
      const response = await request(app).get('/api/admin/bookings/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.totalBookings).toBeDefined();
      expect(response.body.data.revenue).toBeDefined();
    });
  });
});
