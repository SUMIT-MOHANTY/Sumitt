import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, AuthContext } from '../../contexts/AuthContext';

// Mock local storage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Mock fetch API
global.fetch = jest.fn();

// Set up localStorage mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component that consumes AuthContext
const TestComponent = () => {
  const { currentUser, login, logout, isAuthenticated } = React.useContext(AuthContext);
  return (
    <div>
      {currentUser && <div data-testid="user-email">{currentUser.email}</div>}
      <div data-testid="auth-status">
        {isAuthenticated() ? 'Authenticated' : 'Not authenticated'}
      </div>
      <button onClick={() => login('test@example.com', 'password123')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  test('initializes with no user when storage is empty', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
    expect(screen.queryByTestId('user-email')).not.toBeInTheDocument();
  });

  test('initializes with user from storage', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    const mockToken = 'mock-token';

    // Set up localStorage with auth data
    localStorageMock.getItem.mockImplementation(key => {
      if (key === 'auth_user') return JSON.stringify(mockUser);
      if (key === 'auth_token') return mockToken;
      return null;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });

  test('login function stores user and updates state', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    const mockResponse = { ok: true, json: () => Promise.resolve({ token: 'token123', user: mockUser }) };

    // Mock successful API call
    global.fetch.mockResolvedValueOnce(mockResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Check initial state
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');

    // Click login button
    act(() => {
      screen.getByText('Login').click();
    });

    // Verify fetch was called with correct parameters
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        }),
      });
    });

    // Check updated state
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'token123');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_user', JSON.stringify(mockUser));
  });

  test('logout function clears auth state', async () => {
    // Set up initial authenticated state
    const mockUser = { id: '123', email: 'test@example.com' };
    const mockToken = 'mock-token';

    localStorageMock.getItem.mockImplementation(key => {
      if (key === 'auth_user') return JSON.stringify(mockUser);
      if (key === 'auth_token') return mockToken;
      return null;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Check initial authenticated state
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });

    // Click logout button
    act(() => {
      screen.getByText('Logout').click();
    });

    // Check state after logout
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
      expect(screen.queryByTestId('user-email')).not.toBeInTheDocument();
    });

    // Verify localStorage items were removed
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user');
  });
});
