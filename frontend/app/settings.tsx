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
import {
  ArrowLeft,
  Bell,
  Moon,
  MapPin,
  Globe,
  Shield,
  ChevronRight,
} from "lucide-react-native";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const router = useRouter();

  // Mock States
  const [pushEnabled, setPushEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);

  interface SettingItemProps {
    icon: any;
    label: string;
    type?: "link" | "toggle";
    value?: boolean;
    onToggle?: (val: boolean) => void;
    color?: string;
  }

  const SettingItem = ({
    icon: Icon,
    label,
    type = "link",
    value,
    onToggle,
    color = "#6b7280",
  }: SettingItemProps) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemLeft}>
        <View style={[styles.iconBg, { backgroundColor: `${color}15` }]}>
          <Icon size={20} color={color} />
        </View>
        <Text style={styles.itemLabel}>{label}</Text>
      </View>

      {type === "toggle" ? (
        <Switch
          trackColor={{ false: "#d1d5db", true: "#10b981" }}
          thumbColor={"#fff"}
          onValueChange={onToggle}
          value={value}
        />
      ) : (
        <TouchableOpacity>
          <ChevronRight size={20} color="#9ca3af" />
        </TouchableOpacity>
      )}
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
            <Text style={styles.headerTitle}>Settings</Text>
            <View style={{ width: 24 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Preferences</Text>
          <View style={styles.card}>
            <SettingItem
              icon={Bell}
              label="Push Notifications"
              type="toggle"
              value={pushEnabled}
              onToggle={setPushEnabled}
              color="#f59e0b"
            />
            <View style={styles.divider} />
            <SettingItem
              icon={Moon}
              label="Dark Mode"
              type="toggle"
              value={darkMode}
              onToggle={setDarkMode}
              color="#6366f1"
            />
            <View style={styles.divider} />
            <SettingItem
              icon={Globe}
              label="Language"
              type="link"
              color="#3b82f6"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Privacy & Permissions</Text>
          <View style={styles.card}>
            <SettingItem
              icon={MapPin}
              label="Location Access"
              type="toggle"
              value={locationEnabled}
              onToggle={setLocationEnabled}
              color="#ef4444"
            />
            <View style={styles.divider} />
            <SettingItem
              icon={Shield}
              label="Privacy Policy"
              type="link"
              color="#10b981"
            />
            <View style={styles.divider} />
            <SettingItem
              icon={Shield}
              label="Terms of Service"
              type="link"
              color="#10b981"
            />
          </View>
        </View>

        <Text style={styles.version}>App Version 1.0.0 (Build 45)</Text>
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
  section: { marginBottom: 24 },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 12,
    marginLeft: 4,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    elevation: 2,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  itemLabel: { fontSize: 16, color: "#1f2937", fontWeight: "500" },
  divider: { height: 1, backgroundColor: "#f3f4f6" },
  version: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 20,
    marginBottom: 40,
  },
});
