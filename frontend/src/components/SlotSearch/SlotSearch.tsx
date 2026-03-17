import React, { useState, useEffect } from 'react';
import { getLocations, searchSlots, SlotSearchParams } from '../../services/api';
import SlotSearchResults from './SlotSearchResults';

interface Location {
  id: number;
  name: string;
}

const SlotSearch: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<number | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchParams, setSearchParams] = useState<SlotSearchParams>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        const response = await getLocations();
        setLocations(response.locations || []);
        setError(null);
      } catch (err) {
        setError('Failed to load locations. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Handle form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare search parameters
    const params: SlotSearchParams = {};
    if (selectedLocation) params.location_id = selectedLocation;
    if (selectedDate) params.date = selectedDate;

    try {
      setIsSearching(true);
      setError(null);
      setSearchParams(params);
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="slot-search-container">
      <h2>Search Available Appointment Slots</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <label htmlFor="location">Passport Office Location:</label>
          <select
            id="location"
            value={selectedLocation || ''}
            onChange={(e) => setSelectedLocation(e.target.value ? parseInt(e.target.value) : undefined)}
            disabled={isLoading}
          >
            <option value="">-- Select a Location --</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Appointment Date:</label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="search-button"
          disabled={isLoading || isSearching}
        >
          {isSearching ? 'Searching...' : 'Search Slots'}
        </button>
      </form>

      {/* Show search results */}
      <SlotSearchResults
        searchParams={searchParams}
        isSearching={isSearching}
      />

      <style jsx>{`
        .slot-search-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .search-form {
          background-color: #f5f5f5;
          padding: 20px;
          border-radius: 5px;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }

        select, input[type="date"] {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }

        .search-button {
          background-color: #1976d2;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }

        .search-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
};

export default SlotSearch;
