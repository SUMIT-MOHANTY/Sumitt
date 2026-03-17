import React, { createContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

// Create auth context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in (from localStorage or session)
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        setLoading(true);
        // First check localStorage for token
        const token = localStorage.getItem('authToken');

        if (token) {
          // Configure axios to use token in headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Verify token with backend
          try {
            const response = await axios.get('/api/auth/me');
            if (response.data && response.data.user) {
              setUser(response.data.user);
            } else {
              // Invalid token response
              localStorage.removeItem('authToken');
              delete axios.defaults.headers.common['Authorization'];
            }
          } catch (err) {
            // Token validation failed
            console.error('Token validation error:', err);
            localStorage.removeItem('authToken');
            delete axios.defaults.headers.common['Authorization'];
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError('Failed to authenticate user');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      if (response.data && response.data.token) {
        // Save token to localStorage
        localStorage.setItem('authToken', response.data.token);

        // Set auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        // Update user state
        setUser(response.data.user);
        return true;
      } else {
        setError('Login failed: Invalid response from server');
        return false;
      }
    } catch (err) {
      let errorMessage = 'Login failed';
      if (err.response) {
        // The request was made and the server responded with a status code
        errorMessage = err.response.data?.message || err.response.data?.error || 'Server error';
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your internet connection.';
      } else {
        // Something happened in setting up the request
        errorMessage = err.message || 'An unexpected error occurred';
      }
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  // Auth context value
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
