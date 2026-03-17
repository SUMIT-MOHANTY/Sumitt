const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/index');
const Slot = require('../../src/models/Slot');

describe('GET /api/slots/search', () => {
  beforeAll(async () => {
    // Create test slots if needed
    // This is a simplified test setup
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should return slots filtered by date', async () => {
    const res = await request(app)
      .get('/api/slots/search')
      .query({ date: '2023-01-01' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBeTruthy();
  });

  it('should return 400 for invalid locationId', async () => {
    const res = await request(app)
      .get('/api/slots/search')
      .query({ locationId: 'invalid-id' });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error');
  });

  it('should return slots filtered by date range', async () => {
    const res = await request(app)
      .get('/api/slots/search')
      .query({
        startDate: '2023-01-01',
        endDate: '2023-01-10'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBeTruthy();
  });
});
