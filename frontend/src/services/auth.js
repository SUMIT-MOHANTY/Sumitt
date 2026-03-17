/**
 * Authentication Service
 * Handles all authentication related API calls
 */
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configure axios with credentials
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Error logging middleware
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Register a new user
 * @param {Object} userData - User data with email, password, etc.
 * @returns {Promise} - API response
 */
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error?.response?.data || { message: 'Registration failed' };
  }
};

/**
 * Login user
 * @param {Object} credentials - User credentials
 * @returns {Promise} - API response with user data and token
 */
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    localStorage.setItem('authToken', response.data.token);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error?.response?.data || { message: 'Login failed' };
  }
};

/**
 * Logout current user
 */
export const logout = () => {
  try {
    localStorage.removeItem('authToken');
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
};

/**
 * Check if user is authenticated
 * @returns {Boolean} - Authentication status
 */
export const isAuthenticated = () => {
  try {
    return !!localStorage.getItem('authToken');
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};

export default {
  register,
  login,
  logout,
  isAuthenticated
};
