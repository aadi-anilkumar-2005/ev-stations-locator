import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  MapPin,
  Phone,
  Search,
  List,
  Clock,
  Wrench,
} from "lucide-react-native";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { calculateDistance } from "@/utils/distance";

export default function ServiceStationsScreen() {
  const router = useRouter();
  const { location } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStations();
  }, [location]);

  const fetchStations = async () => {
    setLoading(true);
    try {
      let data = [];
      if (location) {
        data = await api.getNearbyPlaces(location.latitude, location.longitude);
      } else {
        data = await api.getNearbyPlaces(37.77, -122.41);
      }
      // Filter for Service Stations
      const serviceStations = data.filter(
        (s: any) => s.place_type === "SERVICE",
      );
      setStations(serviceStations);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredStations = stations.filter((station) =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#6b7280" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>Service Stations</Text>
        <TouchableOpacity>
          <List size={24} color="#6b7280" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#9ca3af" strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search service stations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Nearby Service Centers</Text>
          <Text style={styles.resultCount}>
            {filteredStations.length} results
          </Text>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <ActivityIndicator size="large" color="#f59e0b" />
          </View>
        ) : (
          <ScrollView
            style={styles.stationList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {filteredStations.map((station) => (
              <TouchableOpacity
                key={station.id}
                style={styles.stationCard}
                onPress={() =>
                  router.push(`/service-station-details?id=${station.id}`)
                }
              >
                <Image
                  source={{
                    uri:
                      station.images && station.images.length > 0
                        ? station.images[0]
                        : "https://images.pexels.com/photos/3803518/pexels-photo-3803518.jpeg?auto=compress&cs=tinysrgb&w=400",
                  }}
                  style={styles.stationImage}
                />
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitle}>
                      <Text style={styles.stationName}>{station.name}</Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                          marginTop: 4,
                        }}
                      >
                        <Wrench size={14} color="#f59e0b" />
                        <Text style={{ fontSize: 13, color: "#6b7280" }}>
                          Service Center
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.distance}>
                      {station.distance != null
                        ? station.distance.toFixed(1) + " mi"
                        : location
                          ? calculateDistance(
                              location.latitude,
                              location.longitude,
                              station.latitude,
                              station.longitude,
                            ).toFixed(1) + " mi"
                          : ""}
                    </Text>
                  </View>

                  <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                      <MapPin size={16} color="#6b7280" strokeWidth={2} />
                      <Text style={styles.detailText} numberOfLines={1}>
                        {station.address}
                      </Text>
                    </View>
                    {station.operator ? (
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailText, { color: "#f59e0b" }]}>
                          {station.operator}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Removed Services list and Rating as per request to remove mocked data */}

                  <View style={styles.hoursRow}>
                    <Clock size={14} color="#9ca3af" strokeWidth={2} />
                    <Text style={styles.hours}>
                      {station.opening_hours ||
                        (station.status === "ACTIVE" ? "Open" : station.status)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
  },
  mapContainer: {
    height: 200,
    backgroundColor: "#f3f4f6",
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mapText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
  },
  listContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  resultCount: {
    fontSize: 14,
    color: "#6b7280",
  },
  stationList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  stationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stationImage: {
    width: "100%",
    height: 160,
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  reviews: {
    fontSize: 14,
    color: "#6b7280",
  },
  distance: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f59e0b",
  },
  cardDetails: {
    gap: 6,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: "#6b7280",
  },
  servicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  serviceTag: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  serviceText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#f59e0b",
  },
  hoursRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  hours: {
    fontSize: 12,
    color: "#9ca3af",
  },
});
