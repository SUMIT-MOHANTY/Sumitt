const request = require('supertest');
const mongoose = require('mongoose');
const { app, connectDB } = require('../src/app');
const User = require('../src/models/User');

// Mock data
const testUser = {
  email: 'test@example.com',
  password: 'Password123',
  firstName: 'Test',
  lastName: 'User'
};

// Connect to the test database before tests
beforeAll(async () => {
  await connectDB();
});

// Clean up after tests
afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    beforeEach(async () => {
      // Clean up users before each test
      await User.deleteMany({});
    });

    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toHaveProperty('email', testUser.email);

      // Check that password is not returned
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should fail if email already exists', async () => {
      // First create a user
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      // Try to create the same user again
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toEqual(409);
      expect(res.body.success).toBe(false);
    });

    it('should validate email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should validate password requirements', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          password: 'weak'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });
});
