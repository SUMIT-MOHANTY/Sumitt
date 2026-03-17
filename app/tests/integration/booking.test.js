const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const bookingRoutes = require('../../routes/booking.routes');
const User = require('../../models/user');
const Slot = require('../../models/slot');
const Booking = require('../../models/booking');
const jwt = require('jsonwebtoken');

let mongoServer;
let app;
let mockUser;
let mockSlot;
let authToken;

beforeAll(async () => {
  // Setup in-memory database
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Setup express app
  app = express();
  app.use(express.json());
  app.use('/api/bookings', bookingRoutes);

  // Create test user
  mockUser = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  });

  // Create JWT token
  process.env.JWT_SECRET = 'testsecret';
  authToken = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });

  // Create test slot
  mockSlot = await Slot.create({
    date: new Date('2023-12-01'),
    startTime: '10:00',
    endTime: '10:30',
    capacity: 1,
    booked: 0,
    location: 'Test Location',
    isAvailable: true
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Booking API', () => {
  describe('POST /api/bookings', () => {
    it('should create a booking when slot is available', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ slotId: mockSlot._id });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('slotId');

      // Check if slot was updated
      const updatedSlot = await Slot.findById(mockSlot._id);
      expect(updatedSlot.booked).toBe(1);
    });

    it('should prevent duplicate bookings', async () => {
      // Try to book the same slot again
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ slotId: mockSlot._id });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already have a booking');
    });

    it('should reject booking when slot is unavailable', async () => {
      // Create another slot that's already fully booked
      const unavailableSlot = await Slot.create({
        date: new Date('2023-12-02'),
        startTime: '11:00',
        endTime: '11:30',
        capacity: 1,
        booked: 1,
        location: 'Test Location',
        isAvailable: false
      });

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ slotId: unavailableSlot._id });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('no longer available');
    });
  });

  describe('GET /api/bookings/my-bookings', () => {
    it('should return user bookings', async () => {
      const response = await request(app)
        .get('/api/bookings/my-bookings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });
});
