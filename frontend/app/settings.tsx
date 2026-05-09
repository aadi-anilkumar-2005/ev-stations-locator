import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Moon,
  MapPin,
  Globe,
  Shield,
  ChevronRight,
  FileText,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { api } from "../services/api";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, refreshUser, requestLocationAccess } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();

  // Local state initialized from user context
  const [darkMode, setDarkMode] = useState(
    user?.preferences?.is_dark_mode || false,
  );
  const [locationEnabled, setLocationEnabled] = useState(
    user?.preferences?.allow_location_tracking ?? true,
  );

  // Sync local state when user updates (e.g. after refresh)
  useEffect(() => {
    if (user && user.preferences) {
      setDarkMode(user.preferences.is_dark_mode);
      setLocationEnabled(user.preferences.allow_location_tracking);
    }
  }, [user]);

  const handleTogglePreference = async (
    key: string,
    value: boolean,
    setter: (val: boolean) => void,
  ) => {
    // Special handling for Location
    if (key === "allow_location_tracking" && value === true) {
      const granted = await requestLocationAccess();
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Please enable location permissions in your device settings to use this feature.",
        );
        return; // Do not update state or backend
      }
    }

    // Special handling for Dark Mode - toggle theme context immediately
    if (key === "is_dark_mode") {
      toggleTheme();
    }

    // Optimistic update
    setter(value);

    try {
      // Send nested update
      await api.updateProfile({ preferences: { [key]: value } });
      await refreshUser();
    } catch (error) {
      // Revert on failure
      setter(!value);
      // Revert theme if failed
      if (key === "is_dark_mode") toggleTheme();
      Alert.alert("Error", "Failed to update preference");
    }
  };

  const handleLanguagePress = () => {
    Alert.alert("Select Language", "Choose your preferred language", [
      { text: "English (Default)", style: "default" },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  interface SettingItemProps {
    icon: any;
    label: string;
    type?: "link" | "toggle";
    value?: boolean;
    onToggle?: (val: boolean) => void;
    onPress?: () => void;
    color?: string;
  }

  const SettingItem = ({
    icon: Icon,
    label,
    type = "link",
    value,
    onToggle,
    onPress,
    color = "#6b7280",
  }: SettingItemProps) => {
    const Content = (
      <View style={styles.itemContainer}>
        <View style={styles.itemLeft}>
          <View style={[styles.iconBg, { backgroundColor: `${color}15` }]}>
            <Icon size={20} color={color} />
          </View>
          <Text style={[styles.itemLabel, { color: colors.text }]}>
            {label}
          </Text>
        </View>

        {type === "toggle" ? (
          <Switch
            trackColor={{ false: "#d1d5db", true: "#10b981" }}
            thumbColor={"#fff"}
            onValueChange={onToggle}
            value={value}
          />
        ) : (
          <ChevronRight size={20} color={colors.textSecondary} />
        )}
      </View>
    );

    if (type === "toggle") {
      return Content;
    }

    return <TouchableOpacity onPress={onPress}>{Content}</TouchableOpacity>;
  };

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
            <Text style={styles.headerTitle}>Settings</Text>
            <View style={{ width: 24 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Preferences</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <SettingItem
              icon={Moon}
              label="Dark Mode"
              type="toggle"
              value={darkMode}
              onToggle={(val) =>
                handleTogglePreference("is_dark_mode", val, setDarkMode)
              }
              color="#6366f1"
            />
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <SettingItem
              icon={Globe}
              label="Language"
              type="link"
              color="#3b82f6"
              onPress={handleLanguagePress}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Privacy & Permissions</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <SettingItem
              icon={MapPin}
              label="Location Access"
              type="toggle"
              value={locationEnabled}
              onToggle={(val) =>
                handleTogglePreference(
                  "allow_location_tracking",
                  val,
                  setLocationEnabled,
                )
              }
              color="#ef4444"
            />
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <SettingItem
              icon={Shield}
              label="Privacy Policy"
              type="link"
              color="#10b981"
              onPress={() => router.push("/privacy-policy")}
            />
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <SettingItem
              icon={FileText}
              label="Terms of Service"
              type="link"
              color="#10b981"
              onPress={() => router.push("/terms-of-service")}
            />
          </View>
        </View>

        <Text style={styles.version}>App Version 1.0.0 (Build 45)</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  itemLabel: { fontSize: 16, fontWeight: "500" },
  divider: { height: 1 },
  version: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 20,
    marginBottom: 40,
  },
});
