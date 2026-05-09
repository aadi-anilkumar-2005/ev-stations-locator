import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../services/api";
import * as Location from "expo-location";

interface AuthContextType {
  user: any | null;
  token: string | null;
  location: { latitude: number; longitude: number } | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => void;
  setLocation: (loc: { latitude: number; longitude: number }) => void;
  refreshLocation: () => Promise<{
    latitude: number;
    longitude: number;
  } | null>;
  refreshUser: () => Promise<void>;
  requestLocationAccess: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [location, setLocationState] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const locationSubscription =
    React.useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    loadStorageData();
    startLocationTracking();

    // Poll for location services status to handle automatic turn-off
    const statusInterval = setInterval(async () => {
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        setLocationState((prev) => (prev ? null : prev)); // Only update if currently set to avoid re-renders
      } else {
        // Optional: If enabled and we don't have location/subscription, we could restart tracking
        // But user might want to manually trigger it via button if they just turned it on.
        // For now, focusing on REMOVAL as requested.
      }
    }, 3000);

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      clearInterval(statusInterval);
    };
  }, []);

  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationState(null);
        return;
      }

      const serviceStatus = await Location.hasServicesEnabledAsync();
      if (!serviceStatus) {
        setLocationState(null);
        return;
      }

      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          const lat = location.coords.latitude;
          const lng = location.coords.longitude;

          // Update local state so the app knows where we are
          setLocationState({ latitude: lat, longitude: lng });

          // Sync to backend (fire and forget)
          api
            .updateLocation(lat, lng)
            .catch((err) => console.log("Loc sync err", err));
        },
      );
    } catch (e) {
      console.log("Error starting location tracking", e);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const serviceStatus = await Location.hasServicesEnabledAsync();
      if (!serviceStatus) {
        try {
          await Location.enableNetworkProviderAsync();
          // After enabling, start tracking
          startLocationTracking();
        } catch (e) {
          setLocationState(null);
          return null;
        }
      }

      // Re-check status
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        setLocationState(null);
        return null;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationState(null);
        return null;
      }

      // Start tracking if not already (redundant but safe)
      startLocationTracking();

      // Get one-shot for immediate return
      const location = await Location.getCurrentPositionAsync({});
      const newLoc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setLocationState(newLoc); // Update state immediately

      api
        .updateLocation(newLoc.latitude, newLoc.longitude)
        .catch((e) => console.log("Loc sync err", e));

      return newLoc;
    } catch (e: any) {
      if (e?.message?.includes("location unavailable")) {
        setLocationState(null);
      } else {
        console.log("Error getting location", e);
      }
      return null;
    }
  };

  const loadStorageData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("auth_token");
      if (storedToken) {
        setToken(storedToken);
        // Optionally fetch profile to confirm valid token
        try {
          const profile = await api.getProfile();
          setUser(profile);
        } catch (e) {
          // Token expired or invalid
          await signOut();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, password);
      if (data.access) {
        setToken(data.access);
        await AsyncStorage.setItem("auth_token", data.access);
        if (data.refresh) {
          await AsyncStorage.setItem("refresh_token", data.refresh);
        }
      }
      if (data.user) setUser(data.user);

      // Fetch full profile if user object is incomplete in login response
      if (!data.user) {
        const profile = await api.getProfile();
        setUser(profile);
      }

      // Force immediate location update after login
      getCurrentLocation().catch((err) =>
        console.log("Initial location sync failed", err),
      );
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    setIsLoading(true);
    try {
      await api.register(userData);
      await signIn(email, password);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  };

  const signOut = async () => {
    stopLocationTracking();
    await api.logout();
    await AsyncStorage.removeItem("auth_token");
    await AsyncStorage.removeItem("refresh_token");
    setUser(null);
    setToken(null);
  };

  const setLocation = (loc: { latitude: number; longitude: number }) => {
    setLocationState(loc);
  };

  const refreshLocation = async () => {
    return await getCurrentLocation();
  };

  const requestLocationAccess = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        await startLocationTracking();
        return true;
      }
      return false;
    } catch (e) {
      console.log("Error requesting location permission", e);
      return false;
    }
  };

  const refreshUser = async () => {
    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch (e) {
      console.log("Failed to refresh user profile", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        location,
        isLoading,
        signIn,
        signUp,
        signOut,
        setLocation,
        refreshLocation,
        refreshUser,
        requestLocationAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
