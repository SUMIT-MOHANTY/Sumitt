import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Booking {
  id: number;
  date: string;
  status: string;
  locationName: string;
  slotStartTime: string;
  slotEndTime: string;
}

const BookingList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/bookings/my-bookings');
        setBookings(response.data);
        setError(null);
      } catch (err: any) {
        setError('Failed to load your bookings. Please try again.');
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const cancelBooking = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.put(`/api/bookings/${id}/cancel`);

      // Update the local state to reflect the cancellation
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === id ? { ...booking, status: 'cancelled' } : booking
        )
      );

      setError(null);
    } catch (err: any) {
      setError('Failed to cancel booking. Please try again.');
      console.error('Error cancelling booking:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && bookings.length === 0) {
    return <div className="spinner-border" role="status"><span className="sr-only">Loading...</span></div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (bookings.length === 0) {
    return <div className="alert alert-info">You don't have any bookings yet.</div>;
  }

  return (
    <div className="my-bookings">
      <h2>My Bookings</h2>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Time</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{new Date(booking.date).toLocaleDateString()}</td>
                <td>{booking.slotStartTime} - {booking.slotEndTime}</td>
                <td>{booking.locationName}</td>
                <td>
                  <span className={`badge bg-${
                    booking.status === 'confirmed' ? 'success' :
                    booking.status === 'pending' ? 'warning' :
                    'danger'
                  }`}>
                    {booking.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  {booking.status !== 'cancelled' && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => cancelBooking(booking.id)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingList;
