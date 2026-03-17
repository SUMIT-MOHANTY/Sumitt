import React, { createContext, useState, useEffect } from 'react';

/**
 * Authentication Context
 *
 * Provides authentication state and functions to components throughout the app.
 * Features:
 * - User authentication state management
 * - Login/logout functionality
 * - Token storage and management
 * - Session persistence
 */
export const AuthContext = createContext();

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        // Handle potential JSON parsing errors
        console.error('Failed to parse stored user data');
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    }

    setLoading(false);
  }, []);

  /**
   * Login function
   * Authenticates a user with email and password
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      // Replace with actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Store auth data
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      setToken(data.token);
      setCurrentUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout function
   * Removes user authentication state
   */
  const logout = async () => {
    try {
      // Optional: Call logout endpoint
      // await fetch('/api/auth/logout', {
      //   headers: { Authorization: `Bearer ${token}` },
      // });

      // Clear auth state and storage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => {
    return !!token && !!currentUser;
  };

  /**
   * Get authentication headers for API requests
   */
  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Provide auth context value to components
  const value = {
    currentUser,
    loading,
    error,
    token,
    login,
    logout,
    isAuthenticated,
    getAuthHeaders,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
