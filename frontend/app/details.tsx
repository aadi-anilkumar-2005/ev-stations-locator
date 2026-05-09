import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Heart,
  Zap,
  MapPin,
  CalendarCheck,
  CheckCircle,
  Wifi,
  ShoppingBag,
  Coffee,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/services/api";
import { calculateDistance } from "@/utils/distance";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function DetailsScreen() {
  const router = useRouter();
  const { id, type } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { location, token } = useAuth();
  const { colors, theme } = useTheme();

  const [station, setStation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDetails(Number(id));
    }
  }, [id, type]);

  const fetchDetails = async (placeId: number) => {
    try {
      let data;
      // Check type param to distinguish source
      if (!type || type === "station" || type === "place") {
        // Handle 'place' as fallback for legacy links
        const stationData = await api.getStationDetails(placeId);
        // Normalize stationData to match component expectations
        // Calculate price and stats
        // stationData is now the result of serialize_station from the backend

        // Use provided values or fallback
        const chargers = stationData.place_chargers || [];

        // Price and power are already calculated by backend logic but we can fallback if needed
        const priceStr = stationData.price || "N/A";
        const powerKw =
          stationData.power_kw !== undefined ? stationData.power_kw : "N/A";

        data = {
          id: stationData.id || stationData.station_id,
          name: stationData.name,
          operator: stationData.operator || stationData.operator_name, // Backend sends 'operator'
          address:
            stationData.address ||
            `${stationData.street_address || ""} ${stationData.city || ""}`.trim(),
          latitude: Number(stationData.latitude),
          longitude: Number(stationData.longitude),
          status: stationData.status,
          opening_hours: stationData.opening_hours,
          amenities: stationData.amenities || [],
          place_chargers: chargers,
          charger_types: chargers, // Used for count in UI
          images: [],
          price: priceStr,
          power_kw: powerKw,
          distance: stationData.distance, // Backend might calculate this if passed location
          is_favorite: stationData.is_favorite,
        };
      } else {
        // Fallback or error for unknown types
        console.warn("Unknown place type:", type);
        throw new Error("Unknown place type");
      }

      setStation(data);
      if (data.is_favorite !== undefined) {
        setFavorite(data.is_favorite);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!token) {
      router.push("/(tabs)/profile"); // Or appropriate login route
      // Optional: Alert the user
      return;
    }

    // Optimistic update
    setFavorite((prev) => !prev);

    try {
      if (favorite) {
        await api.removeFavorite(station.id, "station");
      } else {
        await api.addFavorite(station.id, "station");
      }
    } catch (e) {
      console.error(e);
      // Revert on error
      setFavorite((prev) => !prev);
    }
  };

  const openNavigation = () => {
    router.push({
      pathname: "/navigation",
      params: {
        placeId: station.id,
        lat: station.latitude,
        lng: station.longitude,
        name: station.name,
        address: station.address,
      },
    });
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.background,
          },
        ]}
      >
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!station)
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Station not found</Text>
      </View>
    );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              station.images && station.images.length > 0
                ? station.images[0]
                : "https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg?auto=compress&cs=tinysrgb&w=1200",
          }}
          style={styles.image}
        />
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              top: 16 + insets.top,
              backgroundColor:
                theme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.9)",
            },
          ]}
          onPress={() => router.back()}
        >
          <ChevronLeft
            size={24}
            color={theme === "dark" ? "#fff" : "#111"}
            strokeWidth={2}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.favoriteButton,
            {
              top: 16 + insets.top,
              backgroundColor:
                theme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.9)",
            },
          ]}
          onPress={toggleFavorite}
        >
          <Heart
            size={24}
            color={favorite ? "#ef4444" : theme === "dark" ? "#fff" : "#111"}
            fill={favorite ? "#ef4444" : "none"}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.stationName, { color: colors.text }]}>
            {station.name}
          </Text>
          <Text
            style={[styles.stationOperator, { color: colors.textSecondary }]}
          >
            {station.operator}
          </Text>
          <Text
            style={[styles.stationAddress, { color: colors.textSecondary }]}
          >
            {station.address}
          </Text>
          <Text style={styles.price}>{station.price}</Text>
        </View>

        <View style={styles.badges}>
          <View
            style={[
              styles.availableBadge,
              { backgroundColor: theme === "dark" ? "#064e3b" : "#ecfdf5" },
            ]}
          >
            <Text style={styles.availableBadgeText}>{station.status}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.card }]}>
            <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
              {station.opening_hours}
            </Text>
          </View>
          {station.is_fast_charging && (
            <View
              style={[
                styles.badgeBlue,
                { backgroundColor: theme === "dark" ? "#1e3a8a" : "#eff6ff" },
              ]}
            >
              <Text style={styles.badgeBlueText}>Fast Charging</Text>
            </View>
          )}
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {station.distance != null
                ? station.distance.toFixed(1)
                : location
                  ? calculateDistance(
                    location.latitude,
                    location.longitude,
                    station.latitude,
                    station.longitude,
                  ).toFixed(1)
                  : "-"}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              km away
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {station.charger_types?.length || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              types
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {station.power_kw}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              kW max
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Charger Types
          </Text>
          <View style={styles.chargerList}>
            {station.place_chargers?.map((charger: any, idx: number) => (
              <View
                key={idx}
                style={[styles.chargerItem, { backgroundColor: colors.card }]}
              >
                <View
                  style={[
                    styles.chargerIcon,
                    {
                      backgroundColor: theme === "dark" ? "#064e3b" : "#ecfdf5",
                    },
                  ]}
                >
                  <Zap
                    size={20}
                    color={charger.is_available ? "#10b981" : "#ef4444"}
                    strokeWidth={2}
                  />
                </View>
                <View style={styles.chargerInfo}>
                  <Text style={[styles.chargerName, { color: colors.text }]}>
                    {charger.name}
                  </Text>
                  <Text
                    style={[
                      styles.chargerPower,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {charger.max_power_kw} kW • {charger.connector_type}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: colors.text,
                    }}
                  >
                    {charger.start_price > 0
                      ? `₹${charger.start_price}/kWh`
                      : "Free"}
                  </Text>
                  {!charger.is_available && (
                    <Text style={{ fontSize: 12, color: "#ef4444" }}>Busy</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Operating Hours
          </Text>
          <View style={[styles.hoursCard, { backgroundColor: colors.card }]}>
            <View style={styles.openNow}>
              <CheckCircle size={20} color="#10b981" strokeWidth={2} />
              <Text style={styles.openNowText}>Info</Text>
            </View>
            <Text style={[styles.hoursText, { color: colors.textSecondary }]}>
              {station.opening_hours}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Amenities
          </Text>
          <View style={styles.amenitiesGrid}>
            {station.amenities?.map((am: string, idx: number) => (
              <View
                key={idx}
                style={[styles.amenityItem, { backgroundColor: colors.card }]}
              >
                <Coffee
                  size={20}
                  color={colors.textSecondary}
                  strokeWidth={2}
                />
                <Text
                  style={[styles.amenityText, { color: colors.textSecondary }]}
                >
                  {am}
                </Text>
              </View>
            ))}
            {(!station.amenities || station.amenities.length === 0) && (
              <Text style={{ color: colors.textSecondary }}>
                No amenities listed.
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Location
          </Text>
          <View
            style={[
              styles.mapPlaceholder,
              { backgroundColor: theme === "dark" ? "#374151" : "#f3f4f6" },
            ]}
          >
            <MapPin size={48} color={colors.textSecondary} strokeWidth={2} />
          </View>
          <Text
            style={[styles.locationAddress, { color: colors.textSecondary }]}
          >
            {station.address}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.navigateButton}
            onPress={openNavigation}
          >
            <MapPin size={20} color="#fff" strokeWidth={2} />
            <Text style={styles.navigateButtonText}>Navigate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.bookButton,
              { backgroundColor: "#10b981" },
            ]}
            onPress={() =>
              router.push({
                pathname: "/booking",
                params: { stationId: station.id, stationName: station.name },
              })
            }
          >
            <CalendarCheck size={20} color="#fff" strokeWidth={2} />
            <Text style={styles.bookButtonText}>Book</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 256,
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 8,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  favoriteButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 8,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 16,
  },
  stationName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
  },
  stationOperator: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 4,
  },
  stationAddress: {
    fontSize: 16,
    color: "#6b7280",
  },
  price: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "bold",
    color: "#10b981",
  },

  priceUnit: {
    fontSize: 14,
    color: "#6b7280",
  },
  badges: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  availableBadge: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableBadgeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#10b981",
  },
  badge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  badgeBlue: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeBlueText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3b82f6",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    marginBottom: 12,
  },
  chargerList: {
    gap: 8,
  },
  chargerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
  },
  chargerIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#ecfdf5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  chargerIconBlue: {
    width: 40,
    height: 40,
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  chargerInfo: {
    flex: 1,
  },
  chargerName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111",
    marginBottom: 2,
  },
  chargerPower: {
    fontSize: 14,
    color: "#6b7280",
  },
  chargerAvailable: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
  },
  chargerOccupied: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
  },
  hoursCard: {
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
  },
  openNow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  openNowText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10b981",
  },
  hoursText: {
    fontSize: 14,
    color: "#6b7280",
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "48%",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
  },
  amenityText: {
    fontSize: 14,
    color: "#374151",
  },
  mapPlaceholder: {
    height: 192,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  locationAddress: {
    fontSize: 14,
    color: "#6b7280",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  navigateButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#10b981",
    padding: 16,
    borderRadius: 12,
  },
  navigateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  bookButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#10b981",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
