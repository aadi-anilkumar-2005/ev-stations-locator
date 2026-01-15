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
  DollarSign,
} from "lucide-react-native";

const MOCK_SHOPS = [
  {
    id: 1,
    name: "PowerCell Battery Store",
    address: "666 Harrison Street",
    distance: "0.5 mi",
    phone: "+1-415-xxx-xxxx",
    rating: 4.6,
    reviews: 234,
    batteryTypes: ["Lithium-Ion", "LiFePO4", "High-Capacity", "Fast-Charge"],
    priceRange: "$1000 - $18,000",
    hours: "10:00 AM - 7:00 PM",
    image:
      "https://images.pexels.com/photos/3803519/pexels-photo-3803519.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 2,
    name: "Battery Hub Pro",
    address: "999 Commercial Street",
    distance: "0.8 mi",
    phone: "+1-415-xxx-xxxx",
    rating: 4.5,
    reviews: 198,
    batteryTypes: ["Standard", "Extended", "Replacement", "Upgrade Kits"],
    priceRange: "$800 - $16,000",
    hours: "9:00 AM - 8:00 PM",
    image:
      "https://images.pexels.com/photos/3803519/pexels-photo-3803519.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 3,
    name: "EnergyMax Batteries",
    address: "111 Henry Adams Street",
    distance: "1.3 mi",
    phone: "+1-415-xxx-xxxx",
    rating: 4.7,
    reviews: 267,
    batteryTypes: ["Premium", "Standard", "Eco-Friendly", "Recyclable"],
    priceRange: "$1200 - $20,000",
    hours: "10:30 AM - 6:30 PM",
    image:
      "https://images.pexels.com/photos/3803519/pexels-photo-3803519.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
];

export default function BatteryShopsScreen() {
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
        <Text style={styles.title}>Battery Shops</Text>
        <TouchableOpacity>
          <List size={24} color="#6b7280" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#9ca3af" strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search battery shops..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <MapPin size={48} color="#9ca3af" strokeWidth={2} />
          <Text style={styles.mapText}>Map View - EV Battery Shops</Text>
        </View>
      </View>

      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Nearby Battery Shops</Text>
          <Text style={styles.resultCount}>{MOCK_SHOPS.length} results</Text>
        </View>

        <ScrollView
          style={styles.shopList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {MOCK_SHOPS.map((shop) => (
            <TouchableOpacity
              key={shop.id}
              style={styles.shopCard}
              onPress={() => router.push(`/battery-shop-details?id=${shop.id}`)}
            >
              <Image source={{ uri: shop.image }} style={styles.shopImage} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitle}>
                    <Text style={styles.shopName}>{shop.name}</Text>
                    <View style={styles.ratingContainer}>
                      <Star
                        size={16}
                        color="#fbbf24"
                        fill="#fbbf24"
                        strokeWidth={2}
                      />
                      <Text style={styles.rating}>{shop.rating}</Text>
                      <Text style={styles.reviews}>({shop.reviews})</Text>
                    </View>
                  </View>
                  <Text style={styles.distance}>{shop.distance}</Text>
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <MapPin size={16} color="#6b7280" strokeWidth={2} />
                    <Text style={styles.detailText}>{shop.address}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Phone size={16} color="#6b7280" strokeWidth={2} />
                    <Text style={styles.detailText}>{shop.phone}</Text>
                  </View>
                </View>

                <View style={styles.batteryTypesContainer}>
                  {shop.batteryTypes.slice(0, 2).map((type, idx) => (
                    <View key={idx} style={styles.batteryTypeTag}>
                      <Text style={styles.batteryTypeText}>{type}</Text>
                    </View>
                  ))}
                  {shop.batteryTypes.length > 2 && (
                    <View style={styles.batteryTypeTag}>
                      <Text style={styles.batteryTypeText}>
                        +{shop.batteryTypes.length - 2} more
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.priceRow}>
                  <DollarSign size={14} color="#ec4899" strokeWidth={2} />
                  <Text style={styles.priceRange}>{shop.priceRange}</Text>
                </View>
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
  shopList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  shopCard: {
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
  shopImage: {
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
  shopName: {
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
    color: "#ec4899",
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
  batteryTypesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  batteryTypeTag: {
    backgroundColor: "#fce7f3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  batteryTypeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#ec4899",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  priceRange: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ec4899",
  },
});
