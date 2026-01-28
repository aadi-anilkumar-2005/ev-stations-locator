import React, { useEffect, useState } from "react";
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
  Globe,
  Clock,
  Heart,
} from "lucide-react-native";
import { api } from "../services/api";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

type Showroom = {
  id: number;
  name: string;
  place_type: string;
  address: string;
  latitude: number;
  longitude: number;
  opening_hours: string | null;
  status: string;
  operator: string; // Now just a string (Brand Name)
  phone: string | null; // Top level
  email: string | null; // Top level
  website: string | null; // Top level
  amenities: string[];
  images: string[];
  distance?: number;
  is_favorite: boolean;
};

export default function ShowroomDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, theme } = useTheme();
  const { token } = useAuth();

  const [showroom, setShowroom] = useState<Showroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    fetchShowroomData();
  }, [id]);

  useEffect(() => {
    if (showroom) {
      setFavorite(showroom.is_favorite);
    }
  }, [showroom]);

  const fetchShowroomData = async () => {
    try {
      if (!id) return;
      setLoading(true);
      setError(null);
      const data = await api.getShowroomDetails(Number(id));
      setShowroom(data);
    } catch (err) {
      console.error("Failed to fetch showroom:", err);
      setError("Failed to load showroom details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!showroom) return;

    if (!token) {
      router.push("/(tabs)/profile");
      return;
    }

    // Optimistic update
    setFavorite((prev) => !prev);

    try {
      if (favorite) {
        await api.removeFavorite(showroom.id, "showroom");
      } else {
        await api.addFavorite(showroom.id, "showroom");
      }
    } catch (e) {
      console.error(e);
      // Revert on error
      setFavorite((prev) => !prev);
    }
  };

  const getAmenityIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("wifi")) return "📶";
    if (lower.includes("coffee") || lower.includes("cafe")) return "☕";
    if (lower.includes("test drive")) return "🚗";
    if (lower.includes("showroom")) return "🏢";
    if (lower.includes("parking")) return "🅿️";
    if (lower.includes("restroom") || lower.includes("toilet")) return "🚻";
    if (lower.includes("wheelchair")) return "♿";
    return "✅"; // Default
  };

  const handleCall = () => {
    if (showroom?.phone) {
      Linking.openURL(`tel:${showroom.phone}`);
    }
  };

  const handleEmail = () => {
    if (showroom?.email) {
      Linking.openURL(`mailto:${showroom.email}`);
    }
  };

  const handleWebsite = () => {
    if (showroom?.website) {
      Linking.openURL(showroom.website);
    }
  };

  const handleDirections = () => {
    if (showroom) {
      const scheme = Platform.select({ ios: "maps:", android: "geo:" });
      const url = Platform.select({
        ios: `${scheme}?q=${showroom.name}&ll=${showroom.latitude},${showroom.longitude}`,
        android: `${scheme}0,0?q=${showroom.latitude},${showroom.longitude}(${showroom.name})`,
      });
      if (url) Linking.openURL(url);
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
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error || !showroom) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={styles.errorText}>{error || "Showroom not found"}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchShowroomData}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButtonFixed}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    );
  }

  // Use the first image from API or a fallback
  const images = showroom.images || [];
  const heroImage =
    images.length > 0
      ? { uri: images[0] }
      : {
          uri: "https://images.pexels.com/photos/3803517/pexels-photo-3803517.jpeg?auto=compress&cs=tinysrgb&w=1200",
        };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.imageContainer}>
        <Image source={heroImage} style={styles.image} />
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
        <TouchableOpacity
          style={[
            styles.favoriteButton,
            {
              backgroundColor:
                theme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.9)",
            },
          ]}
          onPress={toggleFavorite}
        >
          <Heart
            size={24}
            color={favorite ? "#ec4899" : theme === "dark" ? "#fff" : "#111"}
            fill={
              favorite
                ? "#ec4899"
                : theme === "dark"
                  ? "none"
                  : "rgba(255,255,255,0.8)"
            }
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.showroomName, { color: colors.text }]}>
              {showroom.name}
            </Text>
          </View>
          {showroom.distance != null && (
            <Text style={styles.distance}>
              {showroom.distance.toFixed(1)} mi away
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Contact Information
          </Text>

          <TouchableOpacity
            style={[styles.contactItem, { backgroundColor: colors.card }]}
            onPress={handleDirections}
          >
            <MapPin size={20} color="#3b82f6" strokeWidth={2} />
            <View style={styles.contactContent}>
              <Text
                style={[styles.contactLabel, { color: colors.textSecondary }]}
              >
                Address
              </Text>
              <Text style={[styles.contactValue, { color: colors.text }]}>
                {showroom.address}
              </Text>
            </View>
          </TouchableOpacity>

          {showroom.phone && (
            <TouchableOpacity
              style={[styles.contactItem, { backgroundColor: colors.card }]}
              onPress={handleCall}
            >
              <Phone size={20} color="#3b82f6" strokeWidth={2} />
              <View style={styles.contactContent}>
                <Text
                  style={[styles.contactLabel, { color: colors.textSecondary }]}
                >
                  Phone
                </Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>
                  {showroom.phone}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {showroom.email && (
            <TouchableOpacity
              style={[styles.contactItem, { backgroundColor: colors.card }]}
              onPress={handleEmail}
            >
              <Mail size={20} color="#3b82f6" strokeWidth={2} />
              <View style={styles.contactContent}>
                <Text
                  style={[styles.contactLabel, { color: colors.textSecondary }]}
                >
                  Email
                </Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>
                  {showroom.email}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {showroom.website && (
            <TouchableOpacity
              style={[styles.contactItem, { backgroundColor: colors.card }]}
              onPress={handleWebsite}
            >
              <Globe size={20} color="#3b82f6" strokeWidth={2} />
              <View style={styles.contactContent}>
                <Text
                  style={[styles.contactLabel, { color: colors.textSecondary }]}
                >
                  Website
                </Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>
                  {showroom.website}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {showroom.opening_hours && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Operating Hours
            </Text>
            <View
              style={[
                styles.hoursCard,
                { backgroundColor: theme === "dark" ? "#1e3a8a20" : "#eff6ff" },
              ]}
            >
              <Clock size={20} color="#3b82f6" strokeWidth={2} />
              <View style={styles.hoursContent}>
                <Text style={[styles.hoursTitle, { color: colors.text }]}>
                  {showroom.opening_hours}
                </Text>
                <Text
                  style={[
                    styles.hoursSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Daily
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Available Brands
          </Text>
          <View style={styles.brandsContainer}>
            <View
              style={[
                styles.brandCard,
                { backgroundColor: theme === "dark" ? "#1e3a8a20" : "#eff6ff" },
              ]}
            >
              <Text style={styles.brandName}>
                {showroom.operator || "Unknown Brand"}
              </Text>
              <Text
                style={[styles.brandModels, { color: colors.textSecondary }]}
              >
                All Models Available
              </Text>
            </View>
          </View>
        </View>

        {(showroom.amenities || []).length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Services & Facilities
            </Text>
            <View style={styles.amenitiesGrid}>
              {showroom.amenities.map((amenity, index) => (
                <View
                  key={index}
                  style={[styles.amenityItem, { backgroundColor: colors.card }]}
                >
                  <Text style={styles.amenityIcon}>
                    {getAmenityIcon(amenity)}
                  </Text>
                  <Text style={[styles.amenityText, { color: colors.text }]}>
                    {amenity}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.actions}>
          {showroom.phone && (
            <TouchableOpacity style={styles.callButton} onPress={handleCall}>
              <Phone size={20} color="#fff" strokeWidth={2} />
              <Text style={styles.callButtonText}>Call Now</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={handleDirections}
          >
            <MapPin size={20} color="#3b82f6" strokeWidth={2} />
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
  backButtonFixed: {
    position: "absolute",
    top: 48,
    left: 16,
    padding: 8,
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
  showroomName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rating: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  reviews: {
    fontSize: 16,
    color: "#6b7280",
  },
  distance: {
    fontSize: 14,
    color: "#3b82f6",
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
    alignItems: "flex-start",
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
    backgroundColor: "#eff6ff",
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
  brandsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  brandCard: {
    flex: 1,
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  brandName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3b82f6",
    marginBottom: 4,
  },
  brandModels: {
    fontSize: 12,
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
  amenityIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#111",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 12,
  },
  callButtonText: {
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
    backgroundColor: "#f0f9ff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  directionsButtonText: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
});
