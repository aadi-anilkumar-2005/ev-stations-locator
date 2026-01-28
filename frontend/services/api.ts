import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Adjust this if testing on Android Emulator (10.0.2.2) vs Physical Device (LAN IP)
import Constants from "expo-constants";

const getBaseUrl = () => {
  // Try to get the machine's IP from the Expo packager
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(":")[0];

  if (localhost) {
    return `http://${localhost}:8000/api`;
  }

  // Fallback if detection fails
  return "http://192.168.43.122:8000/api";
};

const API_BASE_URL = getBaseUrl();

const getHeaders = async () => {
  const token = await AsyncStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // --- AUTH ---
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Login failed");
    return data;
  },

  register: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        first_name: userData.name,
        last_name: "",
        phone_number: userData.phone_number,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Registration failed");
    return data;
  },

  getProfile: async () => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, { headers });
    if (!response.ok) throw new Error("Failed to fetch profile");
    return response.json();
  },

  updateProfile: async (data: any) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update profile");
    return response.json();
  },

  logout: async () => {
    const headers = await getHeaders();
    const refresh = await AsyncStorage.getItem("refresh_token");

    // Best effort logout
    try {
      await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ refresh }),
      });
    } catch (e) {
      console.log("Logout error", e);
      // ignore
    }
  },

  // --- LOCATION ---
  updateLocation: async (latitude: number, longitude: number) => {
    try {
      const headers = await getHeaders();
      // Updated endpoint path to be under auth/
      await fetch(`${API_BASE_URL}/auth/location/update/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ latitude, longitude }),
      });
    } catch (error) {
      console.error("API: updateLocation ERROR", error);
    }
  },

  getCurrentLocation: async () => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/auth/location/current/`, {
      headers,
    });
    if (response.ok) return response.json();
    return null;
  },

  // --- PLACES ---
  getNearbyPlaces: async (lat: number, lng: number, distance = 10) => {
    // Public endpoint typically, but can be auth'd
    const response = await fetch(
      `${API_BASE_URL}/places/nearby/?lat=${lat}&lng=${lng}&distance=${distance}`,
    );
    if (!response.ok) return [];
    return response.json();
  },

  getShowroomDetails: async (id: number) => {
    const headers = await getHeaders();
    let response = await fetch(`${API_BASE_URL}/showrooms/${id}/`, { headers });

    // If unauthorized (stale token), retry without headers
    if (response.status === 401) {
      response = await fetch(`${API_BASE_URL}/showrooms/${id}/`);
    }

    if (!response.ok) throw new Error("Failed to load showroom details");
    return response.json();
  },

  getServiceCenters: async () => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/service-centers/`, { headers });
    if (!response.ok) return [];
    return response.json();
  },

  getServiceCenterDetails: async (id: number) => {
    const headers = await getHeaders();
    let response = await fetch(`${API_BASE_URL}/service-centers/${id}/`, {
      headers,
    });

    // If unauthorized (stale token), retry without headers
    if (response.status === 401) {
      response = await fetch(`${API_BASE_URL}/service-centers/${id}/`);
    }

    if (!response.ok) throw new Error("Failed to load service center details");
    return response.json();
  },

  getPlaceDetails: async (id: number) => {
    const headers = await getHeaders();
    let response = await fetch(`${API_BASE_URL}/places/${id}/`, { headers });

    // If unauthorized (stale token), retry without headers
    if (response.status === 401) {
      response = await fetch(`${API_BASE_URL}/places/${id}/`);
    }

    if (!response.ok) throw new Error("Failed to load place");
    return response.json();
  },

  getStationDetails: async (id: number) => {
    const headers = await getHeaders();
    let response = await fetch(`${API_BASE_URL}/stations/${id}/`, { headers });
    
    if (response.status === 401) {
       response = await fetch(`${API_BASE_URL}/stations/${id}/`);
    }

    if (!response.ok) throw new Error("Failed to load station details");
    return response.json();
  },

  searchPlaces: async (query: string) => {
    const response = await fetch(
      `${API_BASE_URL}/places/search/?q=${encodeURIComponent(query)}`,
    );
    if (!response.ok) return [];
    return response.json();
  },

  filterPlaces: async (params: any) => {
    // Assemble query string
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(
      `${API_BASE_URL}/places/filter/?${queryString}`,
    );
    if (!response.ok) return [];
    return response.json();
  },

  getPlaceOptions: async () => {
    const response = await fetch(`${API_BASE_URL}/places/options/`);
    if (!response.ok) return { charger_types: [], amenities: [] };
    return response.json();
  },

  // --- MAP ---
  getMapHome: async () => {
    const response = await fetch(`${API_BASE_URL}/map/home/`);
    if (!response.ok) return [];
    return response.json();
  },

  getMapPlace: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/map/place/${id}/`);
    if (!response.ok) return null;
    return response.json();
  },

  // --- FAVORITES ---
  getFavorites: async (lat?: number, lng?: number) => {
    const token = await AsyncStorage.getItem("auth_token");
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

  addFavorite: async (id: number, type: 'station' | 'showroom' | 'service_center' = 'station') => {
    const token = await AsyncStorage.getItem("auth_token");
    if (!token) throw new Error("User not authenticated");

    const headers = await getHeaders();
    const body: any = {};
    let queryParams = "";
    
    if (type === 'station') {
      body.station_id = id;
      queryParams = `?station_id=${id}`;
    } else if (type === 'showroom') {
      body.showroom_id = id;
      queryParams = `?showroom_id=${id}`;
    } else {
      body.service_id = id;
      queryParams = `?service_id=${id}`;
    }

    const response = await fetch(`${API_BASE_URL}/favorites/add/${queryParams}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error("Failed to add favorite");
  },

  removeFavorite: async (id: number, type: 'station' | 'showroom' | 'service_center' = 'station') => {
    const token = await AsyncStorage.getItem("auth_token");
    if (!token) throw new Error("User not authenticated");

    const headers = await getHeaders();
    const body: any = {};
    let queryParams = "";
    
    if (type === 'station') {
      body.station_id = id;
      queryParams = `?station_id=${id}`;
    } else if (type === 'showroom') {
      body.showroom_id = id;
      queryParams = `?showroom_id=${id}`;
    } else {
      body.service_id = id;
      queryParams = `?service_id=${id}`;
    }

    const response = await fetch(`${API_BASE_URL}/favorites/remove/${queryParams}`, {
      method: "DELETE",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error("Failed to remove favorite");
  },
};
