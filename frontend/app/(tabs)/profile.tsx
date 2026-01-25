import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Settings,
  Heart,
  Car,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit2,
  Zap,
} from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";

// Revised menu specific to Discovery & Services
const MENU_ITEMS = [
  {
    icon: Settings,
    label: "App Settings",
    subtitle: "Theme, Language, Permissions",
    color: "#6366f1",
    route: "/settings",
  },
  {
    icon: Bell,
    label: "Notifications",
    subtitle: "Updates & Alerts",
    color: "#f97316",
    route: "/notification-settings",
  },
  {
    icon: HelpCircle,
    label: "Help & Support",
    subtitle: "Contact us",
    color: "#6b7280",
    route: "/HelpSupport",
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/welcome");
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header Section */}
      <LinearGradient
        colors={["#10b981", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>My Profile</Text>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => router.push("/EditProfile")}
            >
              <Edit2 size={20} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                {user?.profile_image ? (
                  <Image
                    source={{ uri: user.profile_image }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {user?.first_name ? user.first_name[0] : "U"}
                  </Text>
                )}
              </View>
              {/* verification badge or status could go here */}
            </View>

            <View style={styles.userDetails}>
              <Text style={styles.name}>
                {user?.first_name} {user?.last_name}
              </Text>
              <Text style={styles.email}>{user?.email}</Text>
              <View style={styles.memberBadge}>
                <Text style={styles.memberText}>EV Member</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* REPLACEMENT: Vehicle Card instead of Stats */}
        {/* Useful for filtering nearby stations by plug type */}
        {/* NEW: Services Option */}
        <TouchableOpacity
          style={styles.vehicleCard}
          onPress={() => router.push("/services")}
        >
          <View style={styles.vehicleHeader}>
            <View style={styles.vehicleIconBg}>
              <Zap size={24} color="#10b981" />
            </View>
            <View>
              <Text style={styles.vehicleTitle}>EV Services</Text>
              <Text style={styles.vehicleSubtitle}>
                Find showrooms & service centers
              </Text>
            </View>
          </View>
          <View style={styles.addVehicleBtn}>
            <ChevronRight size={20} color="#059669" />
          </View>
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuList}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => item.route && router.push(item.route as any)}
            >
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: `${item.color}15` },
                ]}
              >
                <item.icon size={22} color={item.color} strokeWidth={2} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <ChevronRight size={20} color="#d1d5db" />
            </TouchableOpacity>
          ))}

          {/* Sign Out Button */}
          <TouchableOpacity
            style={[styles.menuItem, styles.signOutItem]}
            onPress={handleLogout}
          >
            <View style={[styles.menuIcon, { backgroundColor: "#fee2e2" }]}>
              <LogOut size={22} color="#ef4444" strokeWidth={2} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuLabel, { color: "#ef4444" }]}>
                Sign Out
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 80, // Reduced slightly since we don't have the huge stats card
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    gap: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
  },
  editBtn: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  avatarContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: 84,
    height: 84,
    backgroundColor: "#fff",
    borderRadius: 42,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.2)",
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#10b981",
  },
  userDetails: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
  },
  memberBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  memberText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -40, // Pulls content up to overlap header
  },
  vehicleCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  vehicleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  vehicleIconBg: {
    width: 48,
    height: 48,
    backgroundColor: "#f0fdf4",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
  },
  vehicleSubtitle: {
    fontSize: 13,
    color: "#6b7280",
  },
  addVehicleBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },

  menuList: {
    gap: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  signOutItem: {
    marginTop: 8,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#9ca3af",
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 16,
  },
  versionText: {
    color: "#d1d5db",
    fontSize: 12,
  },
});
