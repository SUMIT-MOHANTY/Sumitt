import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from '../../../components/auth/LoginForm';
import { AuthContext } from '../../../contexts/AuthContext';

// Mock the AuthContext
const mockLogin = jest.fn();

const renderWithAuth = (ui) => {
  return render(
    <AuthContext.Provider value={{ login: mockLogin }}>
      {ui}
    </AuthContext.Provider>
  );
};

describe('LoginForm Component', () => {
  beforeEach(() => {
    mockLogin.mockClear();
  });

  test('renders form elements correctly', () => {
    renderWithAuth(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    renderWithAuth(<LoginForm />);

    // Submit the empty form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Check for validation errors
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();

    // Verify login was not called
    expect(mockLogin).not.toHaveBeenCalled();
  });

  test('validates email format', async () => {
    renderWithAuth(<LoginForm />);

    // Fill in invalid email
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' },
    });

    // Fill in valid password
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Check for validation error
    expect(await screen.findByText(/email is invalid/i)).toBeInTheDocument();

    // Verify login was not called
    expect(mockLogin).not.toHaveBeenCalled();
  });

  test('submits form with valid data', async () => {
    const onSuccess = jest.fn();
    renderWithAuth(<LoginForm onSuccess={onSuccess} />);

    // Mock successful login
    mockLogin.mockResolvedValueOnce({});

    // Fill in valid form data
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for form submission to complete
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'password123');
    });

    // Check if onSuccess callback was called
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  test('handles login error', async () => {
    renderWithAuth(<LoginForm />);

    // Mock failed login
    const errorMsg = 'Invalid credentials';
    mockLogin.mockRejectedValueOnce(new Error(errorMsg));

    // Fill in form data
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Check for error message
    expect(await screen.findByText(errorMsg)).toBeInTheDocument();
  });
});
