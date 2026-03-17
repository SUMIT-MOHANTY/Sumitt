import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegisterForm from './RegisterForm';
import { registerUser } from '../../services/auth';

// Mock the auth service
jest.mock('../../services/auth', () => ({
  registerUser: jest.fn(),
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the registration form', () => {
    render(<RegisterForm />);

    // Check if the form elements are rendered
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Register/i)).toBeInTheDocument();
  });

  test('validates form inputs', async () => {
    render(<RegisterForm />);

    // Submit the form without filling any fields
    fireEvent.click(screen.getByText(/Register/i));

    // Check if validation errors appear
    expect(await screen.findByText(/Email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Password is required/i)).toBeInTheDocument();
  });

  test('validates password match', async () => {
    render(<RegisterForm />);

    // Fill in different passwords
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'differentpassword' },
    });

    // Submit the form
    fireEvent.click(screen.getByText(/Register/i));

    // Check if password match validation appears
    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  test('submits form successfully', async () => {
    // Mock successful registration
    registerUser.mockResolvedValue({ success: true, user: { email: 'test@example.com' } });

    const onSuccess = jest.fn();
    render(<RegisterForm onSuccess={onSuccess} />);

    // Fill in form data
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'password123' },
    });

    // Submit the form
    fireEvent.click(screen.getByText(/Register/i));

    // Wait for the success callback to be called
    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith(expect.objectContaining({
        email: 'test@example.com',
        password: 'password123',
      }));
      expect(onSuccess).toHaveBeenCalled();
    });

    // Check for success message
    expect(await screen.findByText(/Registration successful/i)).toBeInTheDocument();
  });

  test('handles registration error', async () => {
    // Mock failed registration
    const errorMessage = 'Email already exists';
    registerUser.mockRejectedValue(new Error(errorMessage));

    render(<RegisterForm />);

    // Fill in form data
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'password123' },
    });

    // Submit the form
    fireEvent.click(screen.getByText(/Register/i));

    // Check for error message
    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });
});
