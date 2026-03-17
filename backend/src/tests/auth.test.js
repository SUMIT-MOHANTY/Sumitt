const request = require('supertest');
const app = require('../app'); // Assuming there's an app.js file that exports the Express app
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock User model and dependencies
jest.mock('../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Authentication Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should return 400 if password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should return 400 if user does not exist', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors[0].msg).toEqual('Invalid credentials');
    });

    it('should return 400 if password is incorrect', async () => {
      User.findOne.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword'
      });

      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongPassword' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors[0].msg).toEqual('Invalid credentials');
    });

    it('should return JWT token on successful login', async () => {
      User.findOne.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword'
      });

      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(null, 'fake-jwt-token');
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token', 'fake-jwt-token');
    });

    it('should return 500 if server error occurs', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.statusCode).toEqual(500);
      expect(res.text).toEqual('Server error');
    });
  });
});
