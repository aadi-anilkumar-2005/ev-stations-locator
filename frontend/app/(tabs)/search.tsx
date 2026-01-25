import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Search as SearchIcon,
  ChevronLeft,
  MapPin,
  Zap,
  SlidersHorizontal,
  ShoppingBag,
  Wrench,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/services/api";

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState((params.q as string) || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (searchQuery.length > 0) {
      handleSearch(searchQuery);
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const data = await api.searchPlaces(query);
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#6b7280" strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <SearchIcon size={20} color="#9ca3af" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stations, locations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => router.push("/filters")}
        >
          <SlidersHorizontal size={20} color="#10b981" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {loading && (
          <ActivityIndicator
            size="small"
            color="#10b981"
            style={{ marginTop: 20 }}
          />
        )}

        {!loading && results.length === 0 && searchQuery.length > 0 && (
          <Text
            style={{ textAlign: "center", marginTop: 20, color: "#9ca3af" }}
          >
            No stations found.
          </Text>
        )}

        {results.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Results</Text>
            <View style={styles.recentList}>
              {results.map((station: any) => (
                <TouchableOpacity
                  key={station.id}
                  style={styles.recentItem}
                  onPress={() =>
                    router.push({
                      pathname:
                        station.place_type === "SHOWROOM"
                          ? "/showroom-details"
                          : station.place_type === "SERVICE"
                            ? "/service-station-details"
                            : "/details",
                      params: { id: station.id },
                    })
                  }
                >
                  {station.place_type === "SHOWROOM" ? (
                    <ShoppingBag size={20} color="#3b82f6" strokeWidth={2} />
                  ) : station.place_type === "SERVICE" ? (
                    <Wrench size={20} color="#f59e0b" strokeWidth={2} />
                  ) : (
                    <Zap size={20} color="#10b981" strokeWidth={2} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recentText}>{station.name}</Text>
                    <Text
                      style={[
                        {
                          fontSize: 13,
                          color: "#059669",
                          marginBottom: 2,
                        },
                        station.place_type === "SHOWROOM" && {
                          color: "#3b82f6",
                        },
                        station.place_type === "SERVICE" && {
                          color: "#f59e0b",
                        },
                      ]}
                    >
                      {station.operator}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#6b7280" }}>
                      {station.address}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
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
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
  },
  filterButton: {
    backgroundColor: "#ecfdf5",
    padding: 12,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
  },
  content: {
    flex: 1,
    padding: 16,
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
  recentList: {
    gap: 8,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
  },
  recentText: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
  },
  locationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  locationCard: {
    width: "48%",
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    alignItems: "center",
  },
  locationEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111",
    textAlign: "center",
  },
});
