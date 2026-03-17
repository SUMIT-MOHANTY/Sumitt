const { register } = require('../../../src/auth/authController');
const User = require('../../../src/models/user');

// Mock dependencies
jest.mock('../../../src/models/user');

describe('Auth Controller - Register', () => {
  let req, res, mockUser;

  beforeEach(() => {
    mockUser = {
      _id: 'mock-user-id',
      email: 'test@example.com',
      save: jest.fn().mockResolvedValue(true),
      generateAuthToken: jest.fn().mockReturnValue('mock-token')
    };

    req = {
      body: {
        email: 'test@example.com',
        password: 'password123'
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock validation result
    const errors = { isEmpty: jest.fn().mockReturnValue(true) };
    require('express-validator').validationResult = jest.fn().mockReturnValue(errors);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    // Mock User.findOne to return null (no existing user)
    User.findOne = jest.fn().mockResolvedValue(null);
    // Mock User constructor
    User.mockImplementation(() => mockUser);

    await register(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(mockUser.save).toHaveBeenCalled();
    expect(mockUser.generateAuthToken).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      token: 'mock-token',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com'
      }
    });
  });

  it('should return error if email already exists', async () => {
    // Mock User.findOne to return an existing user
    User.findOne = jest.fn().mockResolvedValue({ email: 'test@example.com' });

    await register(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Email is already registered'
    });
  });
});
