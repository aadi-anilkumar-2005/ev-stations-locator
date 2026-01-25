import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Zap, MapPin, Percent, Info } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function NotificationSettingsScreen() {
  const router = useRouter();

  // Mock Settings States
  const [chargingUpdates, setChargingUpdates] = useState(true);
  const [stationAlerts, setStationAlerts] = useState(true);
  const [offers, setOffers] = useState(false);
  const [appUpdates, setAppUpdates] = useState(true);

  interface ToggleItemProps {
    icon: any;
    label: string;
    description: string;
    value: boolean;
    onToggle: (val: boolean) => void;
    color: string;
  }

  const ToggleItem = ({
    icon: Icon,
    label,
    description,
    value,
    onToggle,
    color,
  }: ToggleItemProps) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemTop}>
        <View style={styles.itemLeft}>
          <View style={[styles.iconBg, { backgroundColor: `${color}15` }]}>
            <Icon size={24} color={color} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.itemLabel}>{label}</Text>
            <Text style={styles.itemDesc}>{description}</Text>
          </View>
        </View>
        <Switch
          trackColor={{ false: "#d1d5db", true: "#10b981" }}
          thumbColor={"#fff"}
          onValueChange={onToggle}
          value={value}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#10b981", "#059669"]} style={styles.header}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notification Settings</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Manage Preferences</Text>
        <Text style={styles.sectionSubtitle}>
          Control which notifications you want to receive directly to your
          device.
        </Text>

        <View style={styles.card}>
          <ToggleItem
            icon={Percent}
            label="Charging Updates"
            description="Get notified when your vehicle charging is complete or interrupted."
            value={chargingUpdates}
            onToggle={setChargingUpdates}
            color="#10b981"
          />
          <View style={styles.divider} />
          <ToggleItem
            icon={MapPin}
            label="New Stations"
            description="Alerts when new charging stations are added near you."
            value={stationAlerts}
            onToggle={setStationAlerts}
            color="#3b82f6"
          />
          <View style={styles.divider} />
          <ToggleItem
            icon={Zap}
            label="Promotional Offers"
            description="Discounts and special offers from charging partners."
            value={offers}
            onToggle={setOffers}
            color="#f59e0b"
          />
          <View style={styles.divider} />
          <ToggleItem
            icon={Info}
            label="App Updates & Info"
            description="Important system updates and maintenance schedules."
            value={appUpdates}
            onToggle={setAppUpdates}
            color="#6b7280"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  header: {
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  safeArea: { paddingTop: Platform.OS === "android" ? 40 : 0 },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  backBtn: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
  },
  content: { padding: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 24,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    elevation: 2,
  },
  itemContainer: { paddingVertical: 12 },
  itemTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: { flex: 1 },
  itemLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  itemDesc: { fontSize: 13, color: "#6b7280", lineHeight: 18 },
  divider: { height: 1, backgroundColor: "#f3f4f6", marginVertical: 8 },
});
