import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  Heart,
  Wifi,
  Coffee,
  Armchair,
  Car,
} from "lucide-react-native";
import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

const getAmenityIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("wifi")) return <Wifi size={32} color="#4b5563" />;
  if (n.includes("coffee") || n.includes("refreshment"))
    return <Coffee size={32} color="#4b5563" />;
  if (n.includes("lounge") || n.includes("waiting"))
    return <Armchair size={32} color="#4b5563" />;
  if (n.includes("parking")) return <Car size={32} color="#4b5563" />;
  return <Text style={{ fontSize: 32 }}>✨</Text>;
};

export default function ServiceStationDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id as string;
  const { colors, theme } = useTheme();
  const { token } = useAuth();

  const [station, setStation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStation();
  }, [id]);

  const loadStation = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getServiceCenterDetails(Number(id));
      setStation(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load service center details");
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (station?.phone) {
      Linking.openURL(`tel:${station.phone}`);
    }
  };

  const handleEmail = () => {
    if (station?.email) {
      Linking.openURL(`mailto:${station.email}`);
    }
  };

  const handleMaps = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${station.latitude},${station.longitude}(${station.name})`,
      android: `geo:0,0?q=${station.latitude},${station.longitude}(${station.name})`,
    });
    if (url) Linking.openURL(url);
  };

  const toggleFavorite = async () => {
    if (!station) return;

    if (!token) {
      router.push("/(tabs)/profile");
      return;
    }

    try {
      const isFav = station.is_favorite;
      // Optimistic update
      setStation((prev: any) => ({ ...prev, is_favorite: !isFav }));

      if (isFav) {
        await api.removeFavorite(station.id, "service_center");
      } else {
        await api.addFavorite(station.id, "service_center");
      }
    } catch (e) {
      console.error(e);
      // Revert on error
      setStation((prev: any) => ({
        ...prev,
        is_favorite: !prev.is_favorite,
      }));
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (error || !station) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={styles.errorText}>{error || "Station not found"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadStation}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.retryButton,
            { marginTop: 10, backgroundColor: "#ccc" },
          ]}
          onPress={() => router.back()}
        >
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const imageUrl =
    station.images && station.images.length > 0
      ? station.images[0]
      : "https://images.pexels.com/photos/3803518/pexels-photo-3803518.jpeg?auto=compress&cs=tinysrgb&w=1200";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              backgroundColor:
                theme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.3)",
            },
          ]}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#fff" strokeWidth={2} />
        </TouchableOpacity>
        {/* Favorite functionality can be added here if needed, keeping UI for now */}
        <TouchableOpacity
          style={[
            styles.favoriteButton,
            {
              backgroundColor:
                theme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.3)",
            },
          ]}
          onPress={toggleFavorite}
        >
          <Heart
            size={24}
            color={station.is_favorite ? "#ef4444" : "#f59e0b"}
            fill={station.is_favorite ? "#ef4444" : "none"}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.stationName, { color: colors.text }]}>
              {station.name}
            </Text>
          </View>
          {/* Distance if available */}
          {station.distance != null && (
            <Text style={styles.distance}>
              {station.distance.toFixed(1)} miles away
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Contact Information
          </Text>
          <TouchableOpacity
            style={[styles.contactItem, { backgroundColor: colors.card }]}
            onPress={handleMaps}
          >
            <MapPin size={20} color="#f59e0b" strokeWidth={2} />
            <View style={styles.contactContent}>
              <Text
                style={[styles.contactLabel, { color: colors.textSecondary }]}
              >
                Address
              </Text>
              <Text style={[styles.contactValue, { color: colors.text }]}>
                {station.address}
              </Text>
            </View>
          </TouchableOpacity>

          {station.phone && (
            <TouchableOpacity
              style={[styles.contactItem, { backgroundColor: colors.card }]}
              onPress={handleCall}
            >
              <Phone size={20} color="#f59e0b" strokeWidth={2} />
              <View style={styles.contactContent}>
                <Text
                  style={[styles.contactLabel, { color: colors.textSecondary }]}
                >
                  Phone
                </Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>
                  {station.phone}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {station.email && (
            <TouchableOpacity
              style={[styles.contactItem, { backgroundColor: colors.card }]}
              onPress={handleEmail}
            >
              <Mail size={20} color="#f59e0b" strokeWidth={2} />
              <View style={styles.contactContent}>
                <Text
                  style={[styles.contactLabel, { color: colors.textSecondary }]}
                >
                  Email
                </Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>
                  {station.email}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {station.website && (
            <TouchableOpacity
              style={[styles.contactItem, { backgroundColor: colors.card }]}
              onPress={() => Linking.openURL(station.website)}
            >
              <Text style={{ fontSize: 20 }}>🌐</Text>
              <View style={styles.contactContent}>
                <Text
                  style={[styles.contactLabel, { color: colors.textSecondary }]}
                >
                  Website
                </Text>
                <Text
                  style={[styles.contactValue, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {station.website}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Operating Hours
          </Text>
          <View
            style={[
              styles.hoursCard,
              { backgroundColor: theme === "dark" ? "#FEF3C720" : "#fffbeb" },
            ]}
          >
            <Clock size={20} color="#f59e0b" strokeWidth={2} />
            <View style={styles.hoursContent}>
              <Text style={[styles.hoursTitle, { color: colors.text }]}>
                {station.opening_hours || "Contact for hours"}
              </Text>
              <Text
                style={[styles.hoursSubtitle, { color: colors.textSecondary }]}
              >
                {station.status === "ACTIVE"
                  ? "Open"
                  : station.status || "Unknown"}
              </Text>
            </View>
          </View>
        </View>

        {/* Removed Services Offered and Pricing sections as requested */}

        {station.amenities && station.amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Facilities & Amenities
            </Text>
            <View style={styles.amenitiesGrid}>
              {station.amenities.map((amenity: string, index: number) => (
                <View
                  key={index}
                  style={[styles.amenityItem, { backgroundColor: colors.card }]}
                >
                  <View style={styles.amenityIconContainer}>
                    {getAmenityIcon(amenity)}
                  </View>
                  <Text style={[styles.amenityText, { color: colors.text }]}>
                    {amenity}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.bookButton} onPress={handleCall}>
            <Text style={styles.bookButtonText}>Book Service</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={handleMaps}
          >
            <MapPin size={20} color="#f59e0b" strokeWidth={2} />
            <Text style={styles.directionsButtonText}>Get Directions</Text>
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
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#f59e0b",
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 280,
  },
  backButton: {
    position: "absolute",
    top: 48,
    left: 16,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    padding: 8,
    borderRadius: 24,
  },
  favoriteButton: {
    position: "absolute",
    top: 48,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 8,
    borderRadius: 24,
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  titleContainer: {
    marginBottom: 12,
  },
  stationName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 8,
  },
  distance: {
    fontSize: 14,
    color: "#f59e0b",
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center", // Changed to center for better alignment with icons
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    marginBottom: 8,
  },
  contactContent: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#9ca3af",
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111",
  },
  hoursCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#fffbeb",
    borderRadius: 12,
  },
  hoursContent: {
    flex: 1,
  },
  hoursTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    marginBottom: 2,
  },
  hoursSubtitle: {
    fontSize: 13,
    color: "#6b7280",
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  amenityItem: {
    width: "48%",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  amenityIconContainer: {
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#111",
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  bookButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f59e0b",
    padding: 16,
    borderRadius: 12,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  directionsButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef3c7",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  directionsButtonText: {
    color: "#f59e0b",
    fontSize: 16,
    fontWeight: "600",
  },
});
