import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  MapPin,
  Phone,
  Star,
  Search,
  List,
} from "lucide-react-native";

const MOCK_SHOWROOMS = [
  {
    id: 1,
    name: "Tesla Experience Center",
    address: "555 Market Street",
    distance: "0.2 mi",
    phone: "+1-415-xxx-xxxx",
    rating: 4.8,
    reviews: 328,
    brands: ["Tesla"],
    hours: "10:00 AM - 7:00 PM",
    image:
      "https://images.pexels.com/photos/3803517/pexels-photo-3803517.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 2,
    name: "EV Motors Plus",
    address: "888 Van Ness Avenue",
    distance: "0.6 mi",
    phone: "+1-415-xxx-xxxx",
    rating: 4.6,
    reviews: 215,
    brands: ["Nissan", "Chevrolet", "BMW", "Audi"],
    hours: "9:00 AM - 6:00 PM",
    image:
      "https://images.pexels.com/photos/3803517/pexels-photo-3803517.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 3,
    name: "Green Mobility Hub",
    address: "333 Grant Avenue",
    distance: "0.9 mi",
    phone: "+1-415-xxx-xxxx",
    rating: 4.7,
    reviews: 287,
    brands: ["Hyundai", "Kia", "Volkswagen"],
    hours: "9:30 AM - 7:00 PM",
    image:
      "https://images.pexels.com/photos/3803517/pexels-photo-3803517.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
];

export default function ShowroomsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#6b7280" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>EV Showrooms</Text>
        <TouchableOpacity>
          <List size={24} color="#6b7280" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#9ca3af" strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search showrooms..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <MapPin size={48} color="#9ca3af" strokeWidth={2} />
          <Text style={styles.mapText}>Map View - EV Showrooms</Text>
        </View>
      </View>

      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Nearby Showrooms</Text>
          <Text style={styles.resultCount}>
            {MOCK_SHOWROOMS.length} results
          </Text>
        </View>

        <ScrollView
          style={styles.showroomList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {MOCK_SHOWROOMS.map((showroom) => (
            <TouchableOpacity
              key={showroom.id}
              style={styles.showroomCard}
              onPress={() => router.push(`/showroom-details?id=${showroom.id}`)}
            >
              <Image
                source={{ uri: showroom.image }}
                style={styles.showroomImage}
              />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitle}>
                    <Text style={styles.showroomName}>{showroom.name}</Text>
                    <View style={styles.ratingContainer}>
                      <Star
                        size={16}
                        color="#fbbf24"
                        fill="#fbbf24"
                        strokeWidth={2}
                      />
                      <Text style={styles.rating}>{showroom.rating}</Text>
                      <Text style={styles.reviews}>({showroom.reviews})</Text>
                    </View>
                  </View>
                  <Text style={styles.distance}>{showroom.distance}</Text>
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <MapPin size={16} color="#6b7280" strokeWidth={2} />
                    <Text style={styles.detailText}>{showroom.address}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Phone size={16} color="#6b7280" strokeWidth={2} />
                    <Text style={styles.detailText}>{showroom.phone}</Text>
                  </View>
                </View>

                <View style={styles.brandsContainer}>
                  {showroom.brands.map((brand, idx) => (
                    <View key={idx} style={styles.brandTag}>
                      <Text style={styles.brandText}>{brand}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.hours}>{showroom.hours}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
  showroomList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  showroomCard: {
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
    color: "#10b981",
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
  brandsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  brandTag: {
    backgroundColor: "#eff6ff",
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
    color: "#9ca3af",
  },
});
