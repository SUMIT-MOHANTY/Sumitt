import React, { useState, useEffect } from 'react';
import { searchSlots, Slot, SlotSearchParams } from '../../services/api';

interface SlotSearchResultsProps {
  searchParams: SlotSearchParams;
  isSearching: boolean;
}

const SlotSearchResults: React.FC<SlotSearchResultsProps> = ({ searchParams, isSearching }) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  useEffect(() => {
    // Only search if we have parameters and searchParams has changed
    if (Object.keys(searchParams).length > 0) {
      const fetchSlots = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await searchSlots(searchParams);
          setSlots(response.slots || []);
          setHasSearched(true);
        } catch (err) {
          setError('Failed to fetch available slots. Please try again.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchSlots();
    }
  }, [searchParams]);

  // Format date and time for display
  const formatDateTime = (dateTimeStr: string) => {
    const dateTime = new Date(dateTimeStr);
    return dateTime.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading || isSearching) {
    return <div className="loading">Loading available slots...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!hasSearched) {
    return null; // Don't show anything before first search
  }

  if (slots.length === 0) {
    return (
      <div className="no-results">
        <p>No available appointment slots found for your search criteria.</p>
        <p>Please try different location or date.</p>
      </div>
    );
  }

  return (
    <div className="slot-results">
      <h3>Available Appointment Slots</h3>

      <div className="results-count">
        Found {slots.length} available slot{slots.length !== 1 ? 's' : ''}
      </div>

      <div className="slot-list">
        {slots.map((slot) => (
          <div key={slot.id} className="slot-card">
            <div className="slot-header">
              <h4>{slot.location_name}</h4>
              <div className="capacity-badge">
                {slot.remaining_capacity}/{slot.max_capacity} Available
              </div>
            </div>

            <div className="slot-details">
              <div className="slot-time">
                <strong>Start:</strong> {formatDateTime(slot.start_time)}
              </div>
              <div className="slot-time">
                <strong>End:</strong> {formatDateTime(slot.end_time)}
              </div>
              <div className="slot-capacity">
                <div className="capacity-bar">
                  <div
                    className="capacity-filled"
                    style={{
                      width: `${(slot.booked_count / slot.max_capacity) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>

            <button className="book-button">Book This Slot</button>
          </div>
        ))}
      </div>

      <style jsx>{`
        .slot-results {
          margin-top: 30px;
        }

        .results-count {
          margin-bottom: 15px;
          font-weight: 500;
          color: #555;
        }

        .slot-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .slot-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
        }

        .slot-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .slot-header {
          background-color: #f5f5f5;
          padding: 10px 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .slot-header h4 {
          margin: 0;
          font-size: 16px;
        }

        .capacity-badge {
          background-color: #e8f5e9;
          color: #2e7d32;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .slot-details {
          padding: 15px;
        }

        .slot-time {
          margin-bottom: 8px;
          font-size: 14px;
        }

        .capacity-bar {
          height: 8px;
          background-color: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 10px;
        }

        .capacity-filled {
          height: 100%;
          background-color: #1976d2;
        }

        .book-button {
          display: block;
          width: 100%;
          padding: 10px;
          background-color: #1976d2;
          color: white;
          border: none;
          font-weight: 500;
          cursor: pointer;
        }

        .book-button:hover {
          background-color: #1565c0;
        }

        .loading {
          text-align: center;
          padding: 20px;
          color: #666;
        }

        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .no-results {
          background-color: #fff8e1;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          color: #ff8f00;
        }
      `}</style>
    </div>
  );
};

export default SlotSearchResults;
