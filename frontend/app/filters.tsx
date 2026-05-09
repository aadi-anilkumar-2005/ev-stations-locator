import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { useTheme } from "@/context/ThemeContext";

export default function FiltersScreen() {
  const router = useRouter();
  const { location } = useAuth();
  const { colors, theme } = useTheme();

  // Dynamic Options from Backend
  const [availableChargerTypes, setAvailableChargerTypes] = useState<string[]>(
    [],
  );
  const [availableAmenities, setAvailableAmenities] = useState<
    { name: string; category: string }[]
  >([]);

  // Selections
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedChargerTypes, setSelectedChargerTypes] = useState<string[]>(
    [],
  );
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [availability, setAvailability] = useState("all");
  const [distance, setDistance] = useState(5);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const data = await api.getPlaceOptions();
      setAvailableChargerTypes(data.charger_types || []);
      // Backend now returns list of { name, category }
      setAvailableAmenities(data.amenities || []);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const toggleChargerType = (type: string) => {
    if (selectedChargerTypes.includes(type)) {
      setSelectedChargerTypes(selectedChargerTypes.filter((t) => t !== type));
    } else {
      setSelectedChargerTypes([...selectedChargerTypes, type]);
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const applyFilters = () => {
    const params: any = {};

    // 0. Place Type
    if (selectedTypes.length > 0) {
      params.type = selectedTypes.join(",");
    }

    // 1. Charger Type
    if (selectedChargerTypes.length > 0) {
      params.charger_type = selectedChargerTypes.join(",");
    }

    // 2. Availability (Removed 24/7)
    if (availability !== "all") {
      params.availability = availability;
    }

    // 3. Distance
    params.distance = distance.toString();

    // 4. Price
    if (minPrice) params.price_min = minPrice;
    if (maxPrice) params.price_max = maxPrice;

    // 5. Amenities
    if (selectedAmenities.length > 0) {
      params.amenities = selectedAmenities.join(",");
    }

    // Pass location
    if (location) {
      params.lat = location.latitude.toString();
      params.lng = location.longitude.toString();
    }

    try {
      const queryString = new URLSearchParams(params).toString();
      router.push(`/listing?${queryString}`);
    } catch (e) {
      console.error(e);
    }
  };

  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedChargerTypes([]);
    setSelectedAmenities([]);
    setAvailability("all");
    setDistance(5);
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color={colors.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Filters</Text>
        <TouchableOpacity onPress={resetFilters}>
          <Text style={styles.resetButton}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Place Type */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Place Type
          </Text>
          <View style={styles.optionsList}>
            {["Charging Station", "Showroom", "Service Center"].map(
              (type, idx) => {
                const value =
                  type === "Charging Station"
                    ? "station"
                    : type === "Showroom"
                      ? "showroom"
                      : "service_center";
                const checked = selectedTypes.includes(value);
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.checkboxOption,
                      { borderColor: colors.border },
                    ]}
                    onPress={() => toggleType(value)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        { borderColor: colors.border },
                        checked && styles.checkboxChecked,
                      ]}
                    />
                    <View style={styles.optionText}>
                      <Text
                        style={[styles.optionLabel, { color: colors.text }]}
                      >
                        {type}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              },
            )}
          </View>
        </View>

        {/* Charger Types */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Charger Type
          </Text>
          <View style={styles.optionsList}>
            {availableChargerTypes.map((type, idx) => {
              const checked = selectedChargerTypes.includes(type);
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.checkboxOption,
                    { borderColor: colors.border },
                  ]}
                  onPress={() => toggleChargerType(type)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      { borderColor: colors.border },
                      checked && styles.checkboxChecked,
                    ]}
                  />
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, { color: colors.text }]}>
                      {type}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            {availableChargerTypes.length === 0 && (
              <Text style={{ color: colors.textSecondary }}>
                Loading types...
              </Text>
            )}
          </View>
        </View>

        {/* Availability */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Station Status
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <TouchableOpacity
              style={[
                styles.amenityChip,
                { borderColor: colors.border },
                availability === "all" && {
                  borderColor: "#10b981",
                  backgroundColor: theme === "dark" ? "#064e3b" : "#ecfdf5",
                },
              ]}
              onPress={() => setAvailability("all")}
            >
              <Text
                style={[
                  styles.amenityLabel,
                  { color: colors.text },
                  availability === "all" && styles.amenityLabelSelected,
                ]}
              >
                All Stations
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.amenityChip,
                { borderColor: colors.border },
                availability === "available" && {
                  borderColor: "#10b981",
                  backgroundColor: theme === "dark" ? "#064e3b" : "#ecfdf5",
                },
              ]}
              onPress={() => setAvailability("available")}
            >
              <Text
                style={[
                  styles.amenityLabel,
                  { color: colors.text },
                  availability === "available" && styles.amenityLabelSelected,
                ]}
              >
                Available Only
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Distance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Distance
            </Text>
            <Text style={styles.distanceValue}>{distance} miles</Text>
          </View>
          <View style={styles.optionsList}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {[1, 5, 10, 20, 50, 100].map((dist) => (
                <TouchableOpacity
                  key={dist}
                  style={[
                    styles.amenityChip, // Reuse existing chip style
                    {
                      borderColor: colors.border,
                      width: "30%", // approx 3 per row
                      justifyContent: "center",
                    },
                    distance === dist && {
                      borderColor: "#10b981",
                      backgroundColor: theme === "dark" ? "#064e3b" : "#ecfdf5",
                    },
                  ]}
                  onPress={() => setDistance(dist)}
                >
                  <Text
                    style={[
                      { color: colors.text, textAlign: "center" },
                      distance === dist && {
                        color: "#10b981",
                        fontWeight: "500",
                      },
                    ]}
                  >
                    {dist} mi
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Price */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Price Range
            </Text>
            <Text style={styles.priceValue}>₹0.20 - ₹0.40/kWh</Text>
          </View>
          <View style={styles.priceInputs}>
            <TextInput
              style={[
                styles.priceInput,
                { borderColor: colors.border, color: colors.text },
              ]}
              placeholder="Min"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={minPrice}
              onChangeText={setMinPrice}
            />
            <TextInput
              style={[
                styles.priceInput,
                { borderColor: colors.border, color: colors.text },
              ]}
              placeholder="Max"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={maxPrice}
              onChangeText={setMaxPrice}
            />
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Amenities
          </Text>
          <View style={styles.amenitiesGrid}>
            <View style={styles.amenitiesGrid}>
              {availableAmenities
                .filter((item) => {
                  // Logic:
                  // 1. If no place type selected -> show only 'general' (or prompt logic, but here generalized).
                  // Actually, user wants "select option first". So if no type selected, maybe show nothing or just general.
                  // Let's show 'general' by default so it's not empty.
                  if (selectedTypes.length === 0)
                    return item.category === "general";

                  // 2. If 'station' in selectedTypes -> show 'station' + 'general'
                  // 3. If 'showroom' in selectedTypes -> show 'showroom' + 'general'
                  // 4. If 'service_center' -> show 'service' + 'general'

                  const isGeneral = item.category === "general";
                  const isStation =
                    selectedTypes.includes("station") &&
                    item.category === "station";
                  const isShowroom =
                    selectedTypes.includes("showroom") &&
                    item.category === "showroom";
                  const isService =
                    selectedTypes.includes("service_center") &&
                    item.category === "service";

                  return isGeneral || isStation || isShowroom || isService;
                })
                .map((item, idx) => {
                  const amenity = item.name;
                  const selected = selectedAmenities.includes(amenity);
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.amenityChip,
                        { borderColor: colors.border },
                        selected && {
                          borderColor: "#10b981",
                          backgroundColor:
                            theme === "dark" ? "#064e3b" : "#ecfdf5",
                        },
                      ]}
                      onPress={() => toggleAmenity(amenity)}
                    >
                      <View
                        style={[
                          styles.amenityCheckbox,
                          { borderColor: colors.border },
                          selected && styles.amenityCheckboxChecked,
                        ]}
                      />
                      <Text
                        style={[
                          styles.amenityLabel,
                          { color: colors.text },
                          selected && styles.amenityLabelSelected,
                        ]}
                      >
                        {amenity}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              {availableAmenities.length === 0 && (
                <Text style={{ color: colors.textSecondary }}>
                  Loading amenities...
                </Text>
              )}
              {availableAmenities.length > 0 && selectedTypes.length === 0 && (
                <Text
                  style={{
                    width: "100%",
                    color: colors.textSecondary,
                    fontStyle: "italic",
                    marginTop: 8,
                  }}
                >
                  Select a Place Type to see more specific amenities.
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  resetButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10b981",
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
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  optionsList: {
    gap: 8,
  },
  checkboxOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
  },
  checkboxChecked: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    marginBottom: 2,
  },
  optionSubtext: {
    fontSize: 14,
    color: "#9ca3af",
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 10,
  },
  radioSelected: {
    borderColor: "#10b981",
    borderWidth: 6,
  },
  distanceValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#10b981",
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#10b981",
  },
  priceInputs: {
    flexDirection: "row",
    gap: 12,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  amenityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
    width: "48%",
  },
  amenityCheckbox: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderRadius: 4,
  },
  amenityCheckboxChecked: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  amenityLabel: {
    fontSize: 14,
  },
  amenityLabelSelected: {
    color: "#10b981",
    fontWeight: "500",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  applyButton: {
    backgroundColor: "#10b981",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
