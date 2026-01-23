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
  Globe,
  Star,
  Clock,
  Heart,
} from "lucide-react-native";

export default function ShowroomDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: "https://images.pexels.com/photos/3803517/pexels-photo-3803517.jpeg?auto=compress&cs=tinysrgb&w=1200",
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
          <Heart size={24} color="#ec4899" fill="#ec4899" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.showroomName}>Tesla Experience Center</Text>
            <View style={styles.ratingContainer}>
              <Star size={18} color="#fbbf24" fill="#fbbf24" strokeWidth={2} />
              <Text style={styles.rating}>4.8</Text>
              <Text style={styles.reviews}>(328 reviews)</Text>
            </View>
          </View>
          <Text style={styles.distance}>0.2 mi away</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <TouchableOpacity style={styles.contactItem}>
            <MapPin size={20} color="#3b82f6" strokeWidth={2} />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Address</Text>
              <Text style={styles.contactValue}>
                555 Market Street, San Francisco
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem}>
            <Phone size={20} color="#3b82f6" strokeWidth={2} />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>+1-415-xxx-xxxx</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem}>
            <Mail size={20} color="#3b82f6" strokeWidth={2} />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>info@tesla-sf.com</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem}>
            <Globe size={20} color="#3b82f6" strokeWidth={2} />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Website</Text>
              <Text style={styles.contactValue}>www.tesla.com</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operating Hours</Text>
          <View style={styles.hoursCard}>
            <Clock size={20} color="#3b82f6" strokeWidth={2} />
            <View style={styles.hoursContent}>
              <Text style={styles.hoursTitle}>10:00 AM - 7:00 PM</Text>
              <Text style={styles.hoursSubtitle}>Daily</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Brands</Text>
          <View style={styles.brandsContainer}>
            <View style={styles.brandCard}>
              <Text style={styles.brandName}>Tesla</Text>
              <Text style={styles.brandModels}>All Models Available</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services & Facilities</Text>
          <View style={styles.amenitiesGrid}>
            <View style={styles.amenityItem}>
              <Text style={styles.amenityIcon}>🚗</Text>
              <Text style={styles.amenityText}>Test Drive</Text>
            </View>
            <View style={styles.amenityItem}>
              <Text style={styles.amenityIcon}>🏢</Text>
              <Text style={styles.amenityText}>Showroom</Text>
            </View>
            <View style={styles.amenityItem}>
              <Text style={styles.amenityIcon}>☕</Text>
              <Text style={styles.amenityText}>Coffee Bar</Text>
            </View>
            <View style={styles.amenityItem}>
              <Text style={styles.amenityIcon}>📶</Text>
              <Text style={styles.amenityText}>Free WiFi</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Showroom</Text>
          <Text style={styles.description}>
            Experience the future of electric vehicles at our state-of-the-art
            Tesla Experience Center. Our knowledgeable staff is ready to assist
            you with test drives, financing options, and answering any questions
            about Tesla vehicles. Visit us today to explore the full range of
            Tesla models and customize your next EV.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.callButton}>
            <Phone size={20} color="#fff" strokeWidth={2} />
            <Text style={styles.callButtonText}>Call Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.directionsButton}>
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
});
