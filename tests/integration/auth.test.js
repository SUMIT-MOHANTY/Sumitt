const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../src/models/user');

// Import server app after setting up MongoMemoryServer
let app;
let mongoServer;

beforeAll(async () => {
  // Set up MongoDB memory server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGO_URI = mongoUri;

  // Connect to the in-memory database
  await mongoose.connect(mongoUri);

  // Import app only after setting up the MongoDB URI
  app = require('../../src/server');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Authentication API', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.user).toHaveProperty('email', 'test@example.com');

      // Verify user was saved to database
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).not.toBeNull();
      expect(user.email).toBe('test@example.com');
    });

    it('should return error if email already exists', async () => {
      // Create a user first
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      // Try to register with the same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'anotherpassword'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Email is already registered');
    });

    it('should return validation errors for invalid inputs', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'not-an-email',
          password: '123' // too short
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors.length).toBeGreaterThan(0);
    });
  });
});
