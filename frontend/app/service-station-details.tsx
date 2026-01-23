import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  Star,
  Clock,
  Heart,
  Wrench,
} from "lucide-react-native";

export default function ServiceStationDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: "https://images.pexels.com/photos/3803518/pexels-photo-3803518.jpeg?auto=compress&cs=tinysrgb&w=1200",
          }}
          style={styles.image}
        />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#fff" strokeWidth={2} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.favoriteButton}>
          <Heart size={24} color="#f59e0b" fill="#f59e0b" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.stationName}>QuickCharge EV Service</Text>
            <View style={styles.ratingContainer}>
              <Star size={18} color="#fbbf24" fill="#fbbf24" strokeWidth={2} />
              <Text style={styles.rating}>4.5</Text>
              <Text style={styles.reviews}>(189 reviews)</Text>
            </View>
          </View>
          <Text style={styles.distance}>0.4 mi away</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <TouchableOpacity style={styles.contactItem}>
            <MapPin size={20} color="#f59e0b" strokeWidth={2} />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Address</Text>
              <Text style={styles.contactValue}>
                777 Mission Street, San Francisco
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem}>
            <Phone size={20} color="#f59e0b" strokeWidth={2} />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>+1-415-xxx-xxxx</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem}>
            <Mail size={20} color="#f59e0b" strokeWidth={2} />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>service@quickcharge.com</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operating Hours</Text>
          <View style={styles.hoursCard}>
            <Clock size={20} color="#f59e0b" strokeWidth={2} />
            <View style={styles.hoursContent}>
              <Text style={styles.hoursTitle}>8:00 AM - 8:00 PM</Text>
              <Text style={styles.hoursSubtitle}>
                Daily (including weekends)
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services Offered</Text>
          <View style={styles.servicesContainer}>
            <View style={styles.serviceItem}>
              <Wrench size={20} color="#f59e0b" strokeWidth={2} />
              <Text style={styles.serviceText}>Battery Check</Text>
            </View>
            <View style={styles.serviceItem}>
              <Wrench size={20} color="#f59e0b" strokeWidth={2} />
              <Text style={styles.serviceText}>Software Update</Text>
            </View>
            <View style={styles.serviceItem}>
              <Wrench size={20} color="#f59e0b" strokeWidth={2} />
              <Text style={styles.serviceText}>Diagnostics</Text>
            </View>
            <View style={styles.serviceItem}>
              <Wrench size={20} color="#f59e0b" strokeWidth={2} />
              <Text style={styles.serviceText}>Brake Service</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facilities & Amenities</Text>
          <View style={styles.amenitiesGrid}>
            <View style={styles.amenityItem}>
              <Text style={styles.amenityIcon}>🛋️</Text>
              <Text style={styles.amenityText}>Waiting Lounge</Text>
            </View>
            <View style={styles.amenityItem}>
              <Text style={styles.amenityIcon}>📶</Text>
              <Text style={styles.amenityText}>Free WiFi</Text>
            </View>
            <View style={styles.amenityItem}>
              <Text style={styles.amenityIcon}>☕</Text>
              <Text style={styles.amenityText}>Refreshments</Text>
            </View>
            <View style={styles.amenityItem}>
              <Text style={styles.amenityIcon}>🚗</Text>
              <Text style={styles.amenityText}>Parking</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technician Expertise</Text>
          <Text style={styles.description}>
            Our certified EV technicians are experienced in servicing all major
            electric vehicle brands. We use genuine parts and advanced
            diagnostic equipment to ensure your vehicle receives the highest
            quality service. All work comes with a warranty and satisfaction
            guarantee.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.priceCard}>
            <Text style={styles.priceItem}>Basic Diagnostic: $49.99</Text>
            <Text style={styles.priceItem}>Battery Health Check: $79.99</Text>
            <Text style={styles.priceItem}>Software Update: $99.99</Text>
            <Text style={styles.priceItem}>Complete Service: $199.99+</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.bookButton}>
            <Text style={styles.bookButtonText}>Book Service Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.directionsButton}>
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
    backgroundColor: "#fff",
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
  servicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  serviceItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    padding: 12,
  },
  serviceText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#111",
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
  priceCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  priceItem: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111",
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
