import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Adjust this if testing on Android Emulator (10.0.2.2) vs Physical Device (LAN IP)
// The user provided IP: 10.189.164.117 (Old), Detected: 10.43.173.117
const API_BASE_URL = 'http://192.168.43.122:8000/api';

const getHeaders = async () => {
  const token = await AsyncStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // --- AUTH ---
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Login failed');
    return data;
  },

  register: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        first_name: userData.name,
        last_name: '',
        phone_number: userData.phone_number,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Registration failed');
    return data;
  },

  getProfile: async () => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, { headers });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  logout: async () => {
    const headers = await getHeaders();
    const refresh = await AsyncStorage.getItem('refresh_token');
    
    // Best effort logout
    try {
      await fetch(`${API_BASE_URL}/auth/logout/`, { 
        method: 'POST', 
        headers: headers,
        body: JSON.stringify({ refresh }) 
      });
    } catch (e) {
      console.log('Logout error', e); 
      // ignore
    }
  },

  // --- LOCATION ---
  updateLocation: async (latitude: number, longitude: number) => {
    try {
        const headers = await getHeaders();
        // Updated endpoint path to be under auth/
        await fetch(`${API_BASE_URL}/auth/location/update/`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ latitude, longitude }),
        });
    } catch (error) {
        console.error("API: updateLocation ERROR", error);
    }
  },

  getCurrentLocation: async () => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/auth/location/current/`, { headers });
    if (response.ok) return response.json();
    return null;
  },

  // --- STATIONS ---
  getNearbyStations: async (lat: number, lng: number, distance = 10) => {
    // Public endpoint typically, but can be auth'd
    const response = await fetch(`${API_BASE_URL}/stations/nearby/?lat=${lat}&lng=${lng}&distance=${distance}`);
    if (!response.ok) return [];
    return response.json();
  },

  getStationDetails: async (id: number) => {
    const headers = await getHeaders(); 
    let response = await fetch(`${API_BASE_URL}/stations/${id}/`, { headers });
    
    // If unauthorized (stale token), retry without headers
    if (response.status === 401) {
       response = await fetch(`${API_BASE_URL}/stations/${id}/`);
    }

    if (!response.ok) throw new Error('Failed to load station');
    return response.json();
  },

  searchStations: async (query: string) => {
    const response = await fetch(`${API_BASE_URL}/stations/search/?q=${encodeURIComponent(query)}`);
    if (!response.ok) return [];
    return response.json();
  },
  
  filterStations: async (params: any) => {
      // Assemble query string
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/stations/filter/?${queryString}`);
      if (!response.ok) return [];
      return response.json();
  },

  getStationOptions: async () => {
    const response = await fetch(`${API_BASE_URL}/stations/options/`);
    if (!response.ok) return { charger_types: [], amenities: [] };
    return response.json();
  },

  // --- MAP ---
  getMapHome: async () => {
    const response = await fetch(`${API_BASE_URL}/map/home/`);
    if (!response.ok) return [];
    return response.json();
  },

  getMapStation: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/map/station/${id}/`);
    if (!response.ok) return null;
    return response.json();
  },

  // --- FAVORITES ---
  getFavorites: async (lat?: number, lng?: number) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) return [];

    const headers = await getHeaders();
    let url = `${API_BASE_URL}/favorites/`;
    if (lat && lng) {
        url += `?lat=${lat}&lng=${lng}`;
    }
    const response = await fetch(url, { headers });
    if (!response.ok) return [];
    return response.json();
  },

  addFavorite: async (stationId: number) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) return;

    const headers = await getHeaders();
    await fetch(`${API_BASE_URL}/favorites/add/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ station_id: stationId }),
    });
  },

  removeFavorite: async (stationId: number) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) return;

    const headers = await getHeaders();
    await fetch(`${API_BASE_URL}/favorites/remove/`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ station_id: stationId }),
    });
  },
};
