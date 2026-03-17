import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SlotResults from '../../../components/slots/SlotResults';

describe('SlotResults Component', () => {
  const mockOnBookSlot = jest.fn();
  const mockOnLoadMore = jest.fn();

  const mockSlots = [
    {
      id: '1',
      provider: 'Dr. Smith',
      date: '2023-05-15',
      startTime: '09:00',
      endTime: '09:30',
      location: 'Main Office',
      available: true,
    },
    {
      id: '2',
      provider: 'Dr. Jones',
      date: '2023-05-16',
      startTime: '10:00',
      endTime: '10:30',
      location: 'North Branch',
      notes: 'Bring medical history',
      available: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state correctly', () => {
    render(<SlotResults slots={[]} isLoading={true} onBookSlot={mockOnBookSlot} />);

    expect(screen.getByText('Loading available slots...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('renders no results message', () => {
    render(<SlotResults slots={[]} isLoading={false} onBookSlot={mockOnBookSlot} />);

    expect(screen.getByText('No slots found matching your criteria.')).toBeInTheDocument();
  });

  test('renders slots correctly', () => {
    render(<SlotResults slots={mockSlots} onBookSlot={mockOnBookSlot} />);

    // First slot (available)
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.getByText('Main Office')).toBeInTheDocument();
    expect(screen.getAllByText('Book Slot')[0]).not.toBeDisabled();

    // Second slot (unavailable)
    expect(screen.getByText('Dr. Jones')).toBeInTheDocument();
    expect(screen.getByText('North Branch')).toBeInTheDocument();
    expect(screen.getByText('Bring medical history')).toBeInTheDocument();
    expect(screen.getByText('Unavailable')).toBeDisabled();
  });

  test('calls onBookSlot when booking an available slot', async () => {
    render(<SlotResults slots={mockSlots} onBookSlot={mockOnBookSlot} />);

    // Book the first slot (available)
    fireEvent.click(screen.getAllByText('Book Slot')[0]);

    expect(mockOnBookSlot).toHaveBeenCalledWith('1');
  });

  test('displays error message when booking fails', async () => {
    mockOnBookSlot.mockRejectedValueOnce(new Error('Booking failed'));

    render(<SlotResults slots={mockSlots} onBookSlot={mockOnBookSlot} />);

    // Book the first slot (available)
    fireEvent.click(screen.getAllByText('Book Slot')[0]);

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Failed to book slot. Please try again.')).toBeInTheDocument();
    });
  });

  test('shows load more button when hasMore is true', () => {
    render(
      <SlotResults
        slots={mockSlots}
        onBookSlot={mockOnBookSlot}
        onLoadMore={mockOnLoadMore}
        hasMore={true}
      />
    );

    const loadMoreButton = screen.getByRole('button', { name: 'Load More' });
    expect(loadMoreButton).toBeInTheDocument();

    fireEvent.click(loadMoreButton);
    expect(mockOnLoadMore).toHaveBeenCalled();
  });

  test('handles slot with XSS attempt in notes', () => {
    const slotsWithXss = [
      {
        id: '3',
        provider: 'Dr. Evil',
        date: '2023-05-17',
        startTime: '11:00',
        endTime: '12:00',
        location: 'South Office',
        notes: '<script>alert("XSS")</script>Just a <b>note</b>',
        available: true,
      }
    ];

    render(<SlotResults slots={slotsWithXss} onBookSlot={mockOnBookSlot} />);

    // The script tag should be removed but b tag allowed
    const notesElement = screen.getByText(/Just a/);
    expect(notesElement).toBeInTheDocument();
    expect(notesElement.innerHTML).not.toContain('<script>');
    expect(notesElement.innerHTML).toContain('<b>note</b>');
  });
});
