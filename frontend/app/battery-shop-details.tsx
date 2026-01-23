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
  DollarSign,
  Zap,
} from "lucide-react-native";

export default function BatteryShopDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: "https://images.pexels.com/photos/3803519/pexels-photo-3803519.jpeg?auto=compress&cs=tinysrgb&w=1200",
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
            <Text style={styles.shopName}>PowerCell Battery Store</Text>
            <View style={styles.ratingContainer}>
              <Star size={18} color="#fbbf24" fill="#fbbf24" strokeWidth={2} />
              <Text style={styles.rating}>4.6</Text>
              <Text style={styles.reviews}>(234 reviews)</Text>
            </View>
          </View>
          <Text style={styles.distance}>0.5 mi away</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <TouchableOpacity style={styles.contactItem}>
            <MapPin size={20} color="#ec4899" strokeWidth={2} />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Address</Text>
              <Text style={styles.contactValue}>
                666 Harrison Street, San Francisco
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem}>
            <Phone size={20} color="#ec4899" strokeWidth={2} />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>+1-415-xxx-xxxx</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem}>
            <Mail size={20} color="#ec4899" strokeWidth={2} />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>sales@powercell.com</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operating Hours</Text>
          <View style={styles.hoursCard}>
            <Clock size={20} color="#ec4899" strokeWidth={2} />
            <View style={styles.hoursContent}>
              <Text style={styles.hoursTitle}>10:00 AM - 7:00 PM</Text>
              <Text style={styles.hoursSubtitle}>Daily</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Battery Types Available</Text>
          <View style={styles.batteryTypesContainer}>
            <View style={styles.batteryTypeItem}>
              <Zap size={20} color="#ec4899" strokeWidth={2} />
              <Text style={styles.batteryTypeText}>Lithium-Ion</Text>
            </View>
            <View style={styles.batteryTypeItem}>
              <Zap size={20} color="#ec4899" strokeWidth={2} />
              <Text style={styles.batteryTypeText}>LiFePO4</Text>
            </View>
            <View style={styles.batteryTypeItem}>
              <Zap size={20} color="#ec4899" strokeWidth={2} />
              <Text style={styles.batteryTypeText}>High-Capacity</Text>
            </View>
            <View style={styles.batteryTypeItem}>
              <Zap size={20} color="#ec4899" strokeWidth={2} />
              <Text style={styles.batteryTypeText}>Fast-Charge</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range</Text>
          <View style={styles.priceCard}>
            <DollarSign size={24} color="#ec4899" strokeWidth={2} />
            <Text style={styles.priceText}>$1,000 - $18,000</Text>
            <Text style={styles.priceSubtext}>Competitive market pricing</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Us?</Text>
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <Text style={styles.checkmark}>✓</Text>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Genuine Batteries</Text>
                <Text style={styles.benefitSubtext}>
                  100% authentic and certified
                </Text>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.checkmark}>✓</Text>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Extended Warranty</Text>
                <Text style={styles.benefitSubtext}>
                  Up to 8 years coverage
                </Text>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.checkmark}>✓</Text>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>
                  Professional Installation
                </Text>
                <Text style={styles.benefitSubtext}>
                  Expert technicians on staff
                </Text>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.checkmark}>✓</Text>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Recycling Program</Text>
                <Text style={styles.benefitSubtext}>Eco-friendly disposal</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <View style={styles.productsContainer}>
            <View style={styles.productCard}>
              <Text style={styles.productIcon}>🔋</Text>
              <Text style={styles.productName}>Premium 75kWh</Text>
              <Text style={styles.productPrice}>$12,999</Text>
            </View>
            <View style={styles.productCard}>
              <Text style={styles.productIcon}>⚡</Text>
              <Text style={styles.productName}>Fast-Charge 60kWh</Text>
              <Text style={styles.productPrice}>$10,499</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.inquireButton}>
            <Text style={styles.inquireButtonText}>Request Quote</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.directionsButton}>
            <MapPin size={20} color="#ec4899" strokeWidth={2} />
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
  shopName: {
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
    color: "#ec4899",
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
    backgroundColor: "#fce7f3",
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
  batteryTypesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  batteryTypeItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fce7f3",
    borderRadius: 12,
    padding: 12,
  },
  batteryTypeText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#111",
  },
  priceCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#fce7f3",
    borderRadius: 12,
  },
  priceText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ec4899",
  },
  priceSubtext: {
    fontSize: 12,
    color: "#6b7280",
    position: "absolute",
    bottom: 8,
    left: 60,
  },
  benefitsContainer: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
  },
  checkmark: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ec4899",
    marginTop: -2,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    marginBottom: 2,
  },
  benefitSubtext: {
    fontSize: 13,
    color: "#6b7280",
  },
  productsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  productCard: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  productIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ec4899",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  inquireButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ec4899",
    padding: 16,
    borderRadius: 12,
  },
  inquireButtonText: {
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
    backgroundColor: "#fce7f3",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ec4899",
  },
  directionsButtonText: {
    color: "#ec4899",
    fontSize: 16,
    fontWeight: "600",
  },
});
