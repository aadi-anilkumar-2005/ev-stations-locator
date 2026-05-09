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
import { ChevronLeft, MapPin, Phone, Search, List } from "lucide-react-native";
import { api } from "../../services/api";
import { useTheme } from "@/context/ThemeContext";

type Place = {
  id: number;
  name: string;
  place_type: "CHARGING" | "SHOWROOM" | "SERVICE";
  address: string;
  distance?: number;
  operator?: string; // Serializer returns string name
  opening_hours?: string;
  images: string[];
  status: string;
};

export default function ShowroomsScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [showrooms, setShowrooms] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShowrooms();
  }, []);

  const fetchShowrooms = async () => {
    try {
      setLoading(true);
      // Default to SF location if no user location, or use a method to get location if available.
      // For now, we'll try to get nearby places with a default or last known location.
      // Ideally we'd use api.getCurrentLocation() but that requires permission setup which might be complex here.
      // We will use a wide search or default SF coordinates for the demo: 37.7749, -122.4194

      let lat = 37.7749;
      let lng = -122.4194;

      const location = await api.getCurrentLocation();
      if (location) {
        lat = location.latitude;
        lng = location.longitude;
      }

      // Fetch nearby places within 50km/miles to ensure we find some
      const places: Place[] = await api.getNearbyPlaces(lat, lng, 50);

      // Filter for restricted SHOWROOM type only
      const showroomList = places.filter((p) => p.place_type === "SHOWROOM");
      setShowrooms(showroomList);
    } catch (err) {
      console.error("Failed to fetch showrooms:", err);
      setError("Failed to load showrooms");
    } finally {
      setLoading(false);
    }
  };

  const filteredShowrooms = showrooms.filter((place) =>
    place.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={colors.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>EV Showrooms</Text>
        <TouchableOpacity>
          <List size={24} color={colors.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme === "dark" ? "#1f2937" : "#f9fafb" },
        ]}
      >
        <Search size={20} color={colors.textSecondary} strokeWidth={2} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search showrooms..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View
        style={[styles.listContainer, { backgroundColor: colors.background }]}
      >
        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: colors.text }]}>
            Nearby Showrooms
          </Text>
          <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
            {filteredShowrooms.length} results
          </Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : (
          <ScrollView
            style={styles.showroomList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {filteredShowrooms.map((showroom) => (
              <TouchableOpacity
                key={showroom.id}
                style={[styles.showroomCard, { backgroundColor: colors.card }]}
                onPress={() =>
                  router.push(`/showroom-details?id=${showroom.id}`)
                }
              >
                <Image
                  source={{
                    uri:
                      showroom.images?.[0] ||
                      "https://images.pexels.com/photos/3803517/pexels-photo-3803517.jpeg?auto=compress&cs=tinysrgb&w=400",
                  }}
                  style={styles.showroomImage}
                />
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitle}>
                      <Text
                        style={[styles.showroomName, { color: colors.text }]}
                      >
                        {showroom.name}
                      </Text>
                      {/* Rating removed as requested */}
                    </View>
                    {showroom.distance !== undefined && (
                      <Text style={styles.distance}>
                        {showroom.distance.toFixed(1)} mi
                      </Text>
                    )}
                  </View>

                  <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                      <MapPin
                        size={16}
                        color={colors.textSecondary}
                        strokeWidth={2}
                      />
                      <Text
                        style={[
                          styles.detailText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {showroom.address}
                      </Text>
                    </View>
                    {/* Phone might be available in detailed view, but serializer lists operator name here mostly */}
                  </View>

                  <View style={styles.brandsContainer}>
                    <View
                      style={[
                        styles.brandTag,
                        {
                          backgroundColor:
                            theme === "dark" ? "#1e3a8a" : "#eff6ff",
                        },
                      ]}
                    >
                      <Text style={styles.brandText}>
                        {showroom.operator || "Showroom"}
                      </Text>
                    </View>
                  </View>

                  {showroom.opening_hours && (
                    <Text
                      style={[styles.hours, { color: colors.textSecondary }]}
                    >
                      {showroom.opening_hours}
                    </Text>
                  )}
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
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
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
  },
  resultCount: {
    fontSize: 14,
  },
  showroomList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  showroomCard: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  showroomImage: {
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
  showroomName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  distance: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
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
  },
  brandsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  brandTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  brandText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#3b82f6",
  },
  hours: {
    fontSize: 12,
  },
});
