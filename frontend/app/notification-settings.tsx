import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Zap,
  MapPin,
  Percent,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { api } from "../services/api";

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();

  // Settings States
  const [chargingUpdates, setChargingUpdates] = useState(true);
  const [stationAlerts, setStationAlerts] = useState(true);
  const [offers, setOffers] = useState(false);
  const [appUpdates, setAppUpdates] = useState(true);

  const [amountLoading, setInitialLoading] = useState(true);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const user = await api.getProfile();
      // Ensure we safely access nested properties with defaults
      setChargingUpdates(user.notifications?.notify_charging_updates ?? true);
      setStationAlerts(user.notifications?.notify_station_alerts ?? true);
      setOffers(user.notifications?.notify_promotional_offers ?? false);
      setAppUpdates(user.notifications?.notify_app_updates ?? true);
    } catch (error) {
      console.error("Failed to fetch settings", error);
      showToast("Failed to load settings", "error");
    } finally {
      setInitialLoading(false);
    }
  };

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((current) => ({ ...current, visible: false }));
    }, 3000);
  };

  const handleToggle = async (
    key: string,
    value: boolean,
    setter: (val: boolean) => void,
  ) => {
    // Optimistic update
    setter(value);

    try {
      // Nested Payload
      const payload = { notifications: { [key]: value } };
      await api.updateProfile(payload);
      showToast("Setting updated successfully");
    } catch (error) {
      console.error(`Failed to update ${key}`, error);
      // Revert on error
      setter(!value);
      showToast("Failed to update setting", "error");
    }
  };

  interface ToggleItemProps {
    icon: any;
    label: string;
    description: string;
    value: boolean;
    onToggle: (val: boolean) => void;
    color: string;
    settingKey: string;
  }

  const ToggleItem = ({
    icon: Icon,
    label,
    description,
    value,
    onToggle,
    color,
    settingKey,
  }: ToggleItemProps) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemTop}>
        <View style={styles.itemLeft}>
          <View style={[styles.iconBg, { backgroundColor: `${color}15` }]}>
            <Icon size={24} color={color} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.itemLabel, { color: colors.text }]}>
              {label}
            </Text>
            <Text style={[styles.itemDesc, { color: colors.textSecondary }]}>
              {description}
            </Text>
          </View>
        </View>
        <Switch
          trackColor={{ false: "#d1d5db", true: "#10b981" }}
          thumbColor={"#fff"}
          onValueChange={(val) => handleToggle(settingKey, val, onToggle)}
          value={value}
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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

      {amountLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Manage Preferences
          </Text>
          <Text
            style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
          >
            Control which notifications you want to receive directly to your
            device.
          </Text>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ToggleItem
              icon={Percent}
              label="Charging Updates"
              description="Get notified when your vehicle charging is complete or interrupted."
              value={chargingUpdates}
              onToggle={setChargingUpdates}
              color="#10b981"
              settingKey="notify_charging_updates"
            />
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <ToggleItem
              icon={MapPin}
              label="New Stations"
              description="Alerts when new charging stations are added near you."
              value={stationAlerts}
              onToggle={setStationAlerts}
              color="#3b82f6"
              settingKey="notify_station_alerts"
            />
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <ToggleItem
              icon={Zap}
              label="Promotional Offers"
              description="Discounts and special offers from charging partners."
              value={offers}
              onToggle={setOffers}
              color="#f59e0b"
              settingKey="notify_promotional_offers"
            />
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <ToggleItem
              icon={Info}
              label="App Updates & Info"
              description="Important system updates and maintenance schedules."
              value={appUpdates}
              onToggle={setAppUpdates}
              color="#6b7280"
              settingKey="notify_app_updates"
            />
          </View>
        </ScrollView>
      )}

      {/* Custom Toast Popup */}
      {toast.visible && (
        <View style={styles.toastContainer}>
          <View
            style={[
              styles.toast,
              toast.type === "error" ? styles.toastError : styles.toastSuccess,
            ]}
          >
            {toast.type === "success" ? (
              <CheckCircle size={20} color="#fff" style={{ marginRight: 8 }} />
            ) : (
              <XCircle size={20} color="#fff" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    zIndex: 1,
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
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  card: {
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
    marginBottom: 4,
  },
  itemDesc: { fontSize: 13, lineHeight: 18 },
  divider: { height: 1, marginVertical: 8 },
  toastContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastSuccess: {
    backgroundColor: "#10b981",
  },
  toastError: {
    backgroundColor: "#ef4444",
  },
  toastText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
