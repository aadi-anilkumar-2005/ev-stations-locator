import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Heart, Zap, MapPin, ShoppingBag, Wrench } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { calculateDistance } from "@/utils/distance";

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { location } = useAuth(); // Get location from context
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // The backend returns a list of Favorite objects: { id, station: {...}, created_at }
  // We need to access item.station to get the station details.

  const fetchFavorites = async () => {
    try {
      // Pass location if available
      const data = await api.getFavorites(
        location?.latitude,
        location?.longitude,
      );
      setFavorites(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRemoveFavorite = async (placeId: number) => {
    try {
      // Optimistic update
      setFavorites((prev) =>
        prev.filter((item: any) => item.place.id !== placeId),
      );
      await api.removeFavorite(placeId);
    } catch (e) {
      console.error("Failed to remove favorite", e);
      // Revert if needed, but for now simple log
      fetchFavorites();
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchFavorites();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  if (loading && !refreshing) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>Favorite Stations</Text>
        <Text style={styles.subtitle}>{favorites.length} saved locations</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {favorites.length === 0 && !loading && (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ color: "#6b7280" }}>No favorites yet.</Text>
          </View>
        )}
        {favorites.map((item: any) => {
          const place = item.place;
          if (!place) return null; // Safety check

          return (
            <TouchableOpacity
              key={item.id} // Favorite ID
              style={styles.stationCard}
              onPress={() =>
                router.push({
                  pathname:
                    place.place_type === "SHOWROOM"
                      ? "/showroom-details"
                      : place.place_type === "SERVICE"
                        ? "/service-station-details"
                        : "/details",
                  params: { id: place.id },
                })
              }
            >
              <View style={styles.stationHeader}>
                <View style={styles.stationIcon}>
                  {place.place_type === "SHOWROOM" ? (
                    <ShoppingBag size={24} color="#3b82f6" strokeWidth={2} />
                  ) : place.place_type === "SERVICE" ? (
                    <Wrench size={24} color="#f59e0b" strokeWidth={2} />
                  ) : (
                    <Zap size={24} color="#10b981" strokeWidth={2} />
                  )}
                </View>
                <View style={styles.stationInfo}>
                  <Text style={styles.stationName}>{place.name}</Text>
                  <Text
                    style={[
                      styles.stationOperator,
                      place.place_type === "SHOWROOM" && { color: "#3b82f6" },
                      place.place_type === "SERVICE" && { color: "#f59e0b" },
                    ]}
                  >
                    {place.operator}
                  </Text>
                  <Text style={styles.stationAddress}>{place.address}</Text>
                </View>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation(); // Prevent card press
                    handleRemoveFavorite(place.id);
                  }}
                >
                  <Heart
                    size={24}
                    color="#ef4444"
                    strokeWidth={2}
                    fill="#ef4444"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.stationDetails}>
                <View style={styles.detailItem}>
                  <MapPin size={16} color="#9ca3af" strokeWidth={2} />
                  <Text style={styles.detailText}>
                    {place.distance
                      ? place.distance.toFixed(1) + " mi"
                      : location
                        ? calculateDistance(
                            location.latitude,
                            location.longitude,
                            place.latitude,
                            place.longitude,
                          ).toFixed(1) + " mi"
                        : "N/A"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.availableBadge,
                    place.status !== "ACTIVE" && {
                      backgroundColor: "#fee2e2",
                    },
                    place.place_type === "SHOWROOM" && {
                      backgroundColor: "#eff6ff",
                    },
                    place.place_type === "SERVICE" && {
                      backgroundColor: "#fffbeb",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.availableBadgeText,
                      place.status !== "ACTIVE" && { color: "#ef4444" },
                      place.place_type === "SHOWROOM" && { color: "#3b82f6" },
                      place.place_type === "SERVICE" && { color: "#f59e0b" },
                    ]}
                  >
                    {place.available_count
                      ? `${place.available_count} available`
                      : place.status === "ACTIVE"
                        ? "Available"
                        : "Busy"}
                  </Text>
                </View>
                <Text style={styles.stationPrice}>
                  {place.place_type === "SHOWROOM"
                    ? "Showroom"
                    : place.place_type === "SERVICE"
                      ? "Service Center"
                      : place.price}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#fff",
    padding: 24,
    // paddingTop handled inline
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  stationCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  stationIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#ecfdf5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  stationOperator: {
    fontSize: 14,
    fontWeight: "500",
    color: "#059669",
    marginBottom: 2,
  },
  stationAddress: {
    fontSize: 14,
    color: "#6b7280",
  },
  stationDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: "#6b7280",
  },
  availableBadge: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#10b981",
  },
  stationPrice: {
    marginLeft: "auto",
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
});
