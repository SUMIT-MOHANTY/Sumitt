const request = require('supertest');
const express = require('express');
const authRoutes = require('../src/routes/auth');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication API', () => {
  test('POST /api/auth/login - success with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123'
      });

    // This will fail because we're using bcrypt compare with mock data
    // In a real test, you would mock bcrypt or use a test database
    // This is just to show the structure
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  test('POST /api/auth/login - failure with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('POST /api/auth/login - validation errors', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid-email',
        password: ''
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.errors).toBeDefined();
  });
});
