import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SlotSearch from '../../../components/slots/SlotSearch';

describe('SlotSearch Component', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the search form correctly', () => {
    render(<SlotSearch onSearch={mockOnSearch} />);

    expect(screen.getByText('Find Available Slots')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Time')).toBeInTheDocument();
    expect(screen.getByLabelText('End Time')).toBeInTheDocument();
    expect(screen.getByLabelText('Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Provider')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search for slots/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset search form/i })).toBeInTheDocument();
  });

  test('submits form with valid input', async () => {
    render(<SlotSearch onSearch={mockOnSearch} />);

    // Fill out form
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2023-05-15' } });
    fireEvent.change(screen.getByLabelText('Start Time'), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText('End Time'), { target: { value: '11:00' } });
    fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Medical Center' } });
    fireEvent.change(screen.getByLabelText('Provider'), { target: { value: 'Dr. Smith' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /search for slots/i }));

    // Wait for debounced call
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        date: '2023-05-15',
        startTime: '10:00',
        endTime: '11:00',
        location: 'Medical Center',
        provider: 'Dr. Smith',
      });
    }, { timeout: 500 });
  });

  test('validates time format', async () => {
    render(<SlotSearch onSearch={mockOnSearch} />);

    // Enter invalid time format
    fireEvent.change(screen.getByLabelText('Start Time'), { target: { value: 'invalid' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /search for slots/i }));

    // Ensure validation error appears
    await waitFor(() => {
      expect(screen.getByText(/Start time must be in HH:MM format/i)).toBeInTheDocument();
    });

    // Ensure onSearch was not called
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  test('resets form when reset button clicked', async () => {
    render(<SlotSearch onSearch={mockOnSearch} />);

    // Fill out form
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2023-05-15' } });
    fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Medical Center' } });

    // Click reset
    fireEvent.click(screen.getByRole('button', { name: /reset search form/i }));

    // Check fields are reset
    await waitFor(() => {
      expect(screen.getByLabelText('Date')).toHaveValue('');
      expect(screen.getByLabelText('Location')).toHaveValue('');
    });
  });
});
