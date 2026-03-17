import axios from 'axios';
import { getAuthHeaders } from '../../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface SlotFormData {
  location_id: number;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
}

export interface Slot {
  id: number;
  location_id: number;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  created_at: string;
  updated_at: string;
}

export const createSlot = async (slotData: SlotFormData): Promise<Slot> => {
  try {
    const response = await axios.post(
      `${API_URL}/api/admin/slots/`,
      slotData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.detail || 'Failed to create slot');
    }
    throw new Error('Network error when creating slot');
  }
};

export const getAdminSlots = async (
  locationId?: number,
  skip = 0,
  limit = 100
): Promise<Slot[]> => {
  try {
    const params: Record<string, string | number> = { skip, limit };
    if (locationId) {
      params.location_id = locationId;
    }

    const response = await axios.get(`${API_URL}/api/admin/slots/`, {
      params,
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.detail || 'Failed to fetch slots');
    }
    throw new Error('Network error when fetching slots');
  }
};
