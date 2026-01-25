import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Map, MapPin } from "lucide-react-native";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { calculateDistance } from "@/utils/distance";

export default function ListingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { location } = useAuth();
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStations();
  }, [JSON.stringify(params), location?.latitude, location?.longitude]);

  const fetchStations = async () => {
    setLoading(true);
    try {
      // Check if we have filter params
      if (Object.keys(params).length > 0 && !params.id) {
        // params.id excludes if we just navigated with an id (not likely here but safe check)
        const data = await api.filterPlaces(params);
        setStations(data);
      } else if (location) {
        const data = await api.getNearbyPlaces(
          location.latitude,
          location.longitude,
        );
        setStations(data);
      } else {
        // Fallback
        const data = await api.getNearbyPlaces(37.77, -122.41);
        setStations(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#6b7280" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>Nearby Stations</Text>
        <TouchableOpacity onPress={() => router.back()}>
          {/* Back implies returning to map usually */}
          <Map size={24} color="#6b7280" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBarContent}
        >
          <View style={styles.filterContainer}>
            <TouchableOpacity style={styles.filterChipActive}>
              <Text style={styles.filterChipTextActive}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterChip}
              onPress={() => router.push("/filters")}
            >
              <Text style={styles.filterChipText}>Filters</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {stations.map((station: any) => (
          <TouchableOpacity
            key={station.id}
            style={[
              styles.stationCard,
              station.status === "OFFLINE" && styles.stationCardDisabled,
            ]}
            onPress={() =>
              router.push({
                pathname:
                  station.place_type === "SHOWROOM"
                    ? "/showroom-details"
                    : station.place_type === "SERVICE"
                      ? "/service-station-details"
                      : "/details",
                params: { id: station.id },
              })
            }
          >
            <Image
              source={{
                uri:
                  station.images && station.images.length > 0
                    ? station.images[0]
                    : "https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg?auto=compress&cs=tinysrgb&w=400",
              }}
              style={styles.stationImage}
            />
            <View style={styles.stationContent}>
              <View style={styles.stationHeader}>
                <View style={styles.stationInfo}>
                  <Text style={styles.stationName}>{station.name}</Text>
                  <Text
                    style={[
                      styles.stationOperator,
                      station.place_type === "SHOWROOM" && { color: "#3b82f6" },
                      station.place_type === "SERVICE" && { color: "#f59e0b" },
                    ]}
                  >
                    {station.operator}
                  </Text>
                  <Text style={styles.stationAddress}>{station.address}</Text>
                </View>
              </View>

              <View style={styles.stationBadges}>
                <View
                  style={[
                    styles.availabilityBadge,
                    station.status === "OFFLINE" && styles.unavailableBadge,
                    station.status === "BUSY" && styles.limitedBadge,
                    station.place_type === "SHOWROOM" && styles.showroomBadge,
                    station.place_type === "SERVICE" && styles.serviceBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.availabilityText,
                      station.status === "OFFLINE" && styles.unavailableText,
                      station.status === "BUSY" && styles.limitedText,
                      station.place_type === "SHOWROOM" && styles.showroomText,
                      station.place_type === "SERVICE" && styles.serviceText,
                    ]}
                  >
                    {station.status}
                  </Text>
                </View>
                {station.charger_types &&
                  station.charger_types.map((type: string, idx: number) => (
                    <Text key={idx} style={styles.typeBadge}>
                      {type}{" "}
                    </Text>
                  ))}
              </View>

              <View style={styles.stationFooter}>
                <View style={styles.distanceContainer}>
                  <MapPin size={14} color="#6b7280" />
                  <Text style={styles.distanceText}>
                    {station.distance
                      ? station.distance.toFixed(1) + " mi"
                      : location
                        ? calculateDistance(
                            location.latitude,
                            location.longitude,
                            station.latitude,
                            station.longitude,
                          ).toFixed(1) + " mi"
                        : "N/A"}
                  </Text>
                </View>
                <Text style={styles.priceText}>
                  {station.place_type === "SHOWROOM"
                    ? "Showroom"
                    : station.place_type === "SERVICE"
                      ? "Service Center"
                      : station.price}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  filterBar: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 12,
  },
  filterBarContent: {
    paddingHorizontal: 16,
    gap: 0, // Remove gap to make them touch like segments if needed, or keep small gap
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 4,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 4,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
  },
  filterChipActive: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterChipTextActive: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  stationCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stationCardDisabled: {
    opacity: 0.6,
  },
  stationImage: {
    width: "100%",
    height: 120,
  },
  stationContent: {
    padding: 16,
  },
  stationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
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
  stationBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  availabilityBadge: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#10b981",
  },
  limitedBadge: {
    backgroundColor: "#fff7ed",
  },
  limitedText: {
    color: "#f97316",
  },
  unavailableBadge: {
    backgroundColor: "#fee2e2",
  },
  unavailableText: {
    color: "#ef4444",
  },
  typeBadge: {
    fontSize: 12,
    color: "#6b7280",
  },
  showroomBadge: {
    backgroundColor: "#eff6ff",
  },
  showroomText: {
    color: "#3b82f6",
  },
  serviceBadge: {
    backgroundColor: "#fffbeb",
  },
  serviceText: {
    color: "#f59e0b",
  },
  stationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  distanceText: {
    fontSize: 14,
    color: "#6b7280",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
});
