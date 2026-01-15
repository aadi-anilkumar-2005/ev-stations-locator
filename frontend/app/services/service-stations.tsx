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
  Clock,
} from "lucide-react-native";

const MOCK_STATIONS = [
  {
    id: 1,
    name: "QuickCharge EV Service",
    address: "777 Mission Street",
    distance: "0.4 mi",
    phone: "+1-415-xxx-xxxx",
    rating: 4.5,
    reviews: 189,
    services: [
      "Battery Check",
      "Software Update",
      "Diagnostics",
      "Brake Service",
    ],
    hours: "8:00 AM - 8:00 PM",
    image:
      "https://images.pexels.com/photos/3803518/pexels-photo-3803518.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 2,
    name: "EV Care Pro",
    address: "444 Battery Street",
    distance: "0.7 mi",
    phone: "+1-415-xxx-xxxx",
    rating: 4.4,
    reviews: 156,
    services: ["Maintenance", "Repair", "Inspection", "Warranty Service"],
    hours: "7:30 AM - 7:30 PM",
    image:
      "https://images.pexels.com/photos/3803518/pexels-photo-3803518.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 3,
    name: "ElectroMotion Garage",
    address: "222 Folsom Street",
    distance: "1.1 mi",
    phone: "+1-415-xxx-xxxx",
    rating: 4.3,
    reviews: 142,
    services: ["Tire Service", "Alignment", "Suspension", "Electrical Repair"],
    hours: "8:30 AM - 6:30 PM",
    image:
      "https://images.pexels.com/photos/3803518/pexels-photo-3803518.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
];

export default function ServiceStationsScreen() {
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

      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <MapPin size={48} color="#9ca3af" strokeWidth={2} />
          <Text style={styles.mapText}>Map View - EV Service Stations</Text>
        </View>
      </View>

      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Nearby Service Centers</Text>
          <Text style={styles.resultCount}>{MOCK_STATIONS.length} results</Text>
        </View>

        <ScrollView
          style={styles.stationList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {MOCK_STATIONS.map((station) => (
            <TouchableOpacity
              key={station.id}
              style={styles.stationCard}
              onPress={() =>
                router.push(`/service-station-details?id=${station.id}`)
              }
            >
              <Image
                source={{ uri: station.image }}
                style={styles.stationImage}
              />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitle}>
                    <Text style={styles.stationName}>{station.name}</Text>
                    <View style={styles.ratingContainer}>
                      <Star
                        size={16}
                        color="#fbbf24"
                        fill="#fbbf24"
                        strokeWidth={2}
                      />
                      <Text style={styles.rating}>{station.rating}</Text>
                      <Text style={styles.reviews}>({station.reviews})</Text>
                    </View>
                  </View>
                  <Text style={styles.distance}>{station.distance}</Text>
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <MapPin size={16} color="#6b7280" strokeWidth={2} />
                    <Text style={styles.detailText}>{station.address}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Phone size={16} color="#6b7280" strokeWidth={2} />
                    <Text style={styles.detailText}>{station.phone}</Text>
                  </View>
                </View>

                <View style={styles.servicesContainer}>
                  {station.services.slice(0, 3).map((service, idx) => (
                    <View key={idx} style={styles.serviceTag}>
                      <Text style={styles.serviceText}>{service}</Text>
                    </View>
                  ))}
                  {station.services.length > 3 && (
                    <View style={styles.serviceTag}>
                      <Text style={styles.serviceText}>
                        +{station.services.length - 3} more
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.hoursRow}>
                  <Clock size={14} color="#9ca3af" strokeWidth={2} />
                  <Text style={styles.hours}>{station.hours}</Text>
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
