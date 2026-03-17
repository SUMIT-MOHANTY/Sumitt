// API service for making HTTP requests to the backend

const API_BASE_URL = '/api';

// Error handling helper
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'API request failed');
  }
  return response.json();
};

// Auth API functions
export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

export const register = async (userData: any) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

// Location API functions
export const getLocations = async () => {
  const response = await fetch(`${API_BASE_URL}/locations`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
  });
  return handleResponse(response);
};

// Slot Search API
export interface SlotSearchParams {
  location_id?: number;
  date?: string;
}

export interface Slot {
  id: number;
  location_id: number;
  location_name: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  booked_count: number;
  remaining_capacity: number;
}

export interface SlotSearchResponse {
  slots: Slot[];
}

export const searchSlots = async (params: SlotSearchParams): Promise<SlotSearchResponse> => {
  const queryParams = new URLSearchParams();

  if (params.location_id) {
    queryParams.append('location_id', params.location_id.toString());
  }

  if (params.date) {
    queryParams.append('date', params.date);
  }

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/slots/search${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to search slots');
  }

  return response.json();
};
