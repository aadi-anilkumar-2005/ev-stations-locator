import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Store, Wrench, ArrowLeft } from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";

export default function ServicesScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();

  const services = [
    {
      id: "showrooms",
      icon: Store,
      title: "EV Showrooms",
      subtitle: "Browse & Purchase",
      description: "Find authorized EV showrooms with latest models",
      color: "#3b82f6",
      bgColor: "#eff6ff",
      count: "12 nearby",
    },
    {
      id: "service",
      icon: Wrench,
      title: "Service Stations",
      subtitle: "Maintenance & Repair",
      description: "Professional EV maintenance and repair services",
      color: "#f59e0b",
      bgColor: "#fffbeb",
      count: "8 nearby",
    },
  ];

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
            <Text style={styles.headerTitle}>EV Services</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
          Find everything for your electric vehicle
        </Text>

        <View style={styles.servicesGrid}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[styles.serviceCard, { backgroundColor: colors.card }]}
              onPress={() => {
                if (service.id === "showrooms")
                  router.push("/services/showrooms");
                else if (service.id === "service")
                  router.push("/services/service-stations");
              }}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor:
                      theme === "dark" ? `${service.color}15` : service.bgColor,
                  },
                ]}
              >
                <service.icon size={40} color={service.color} strokeWidth={2} />
              </View>
              <Text style={[styles.serviceTitle, { color: colors.text }]}>
                {service.title}
              </Text>
              <Text
                style={[
                  styles.serviceSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                {service.subtitle}
              </Text>
              <Text
                style={[
                  styles.serviceDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {service.description}
              </Text>
              <View style={styles.cardFooter}>
                <Text
                  style={[
                    styles.countBadge,
                    {
                      backgroundColor: theme === "dark" ? "#064e3b" : "#ecfdf5",
                    },
                  ]}
                >
                  {service.count}
                </Text>
                <Text style={[styles.arrow, { color: colors.textSecondary }]}>
                  →
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.quickAccessSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Access
          </Text>
          <TouchableOpacity
            style={[styles.quickAccessCard, { backgroundColor: colors.card }]}
            onPress={() => router.push("/services/showrooms")}
          >
            <View
              style={[
                styles.quickAccessIcon,
                { backgroundColor: theme === "dark" ? "#1f2937" : "#f9fafb" },
              ]}
            >
              <Store size={24} color="#3b82f6" strokeWidth={2} />
            </View>
            <View style={styles.quickAccessContent}>
              <Text style={[styles.quickAccessTitle, { color: colors.text }]}>
                Latest EV Models
              </Text>
              <Text
                style={[
                  styles.quickAccessSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Explore 2024-2025 models at showrooms
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAccessCard, { backgroundColor: colors.card }]}
            onPress={() => router.push("/services/service-stations")}
          >
            <View
              style={[
                styles.quickAccessIcon,
                { backgroundColor: theme === "dark" ? "#1f2937" : "#f9fafb" },
              ]}
            >
              <Wrench size={24} color="#f59e0b" strokeWidth={2} />
            </View>
            <View style={styles.quickAccessContent}>
              <Text style={[styles.quickAccessTitle, { color: colors.text }]}>
                Regular Maintenance
              </Text>
              <Text
                style={[
                  styles.quickAccessSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Schedule your EV check-up today
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Why Choose Our Services?
          </Text>
          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <View style={styles.infoBullet}>
              <Text style={styles.bulletNumber}>✓</Text>
              <Text style={[styles.bulletText, { color: colors.text }]}>
                Certified EV Specialists
              </Text>
            </View>
            <View style={styles.infoBullet}>
              <Text style={styles.bulletNumber}>✓</Text>
              <Text style={[styles.bulletText, { color: colors.text }]}>
                Genuine Parts & Warranty
              </Text>
            </View>
            <View style={styles.infoBullet}>
              <Text style={styles.bulletNumber}>✓</Text>
              <Text style={[styles.bulletText, { color: colors.text }]}>
                Fast & Reliable Service
              </Text>
            </View>
            <View style={styles.infoBullet}>
              <Text style={styles.bulletNumber}>✓</Text>
              <Text style={[styles.bulletText, { color: colors.text }]}>
                Competitive Pricing
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 24,
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
  content: {
    flex: 1,
  },
  pageSubtitle: {
    fontSize: 16,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 12,
  },
  serviceCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  serviceSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  countBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  arrow: {
    fontSize: 16,
  },
  quickAccessSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  quickAccessCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  quickAccessContent: {
    flex: 1,
  },
  quickAccessTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  quickAccessSubtitle: {
    fontSize: 12,
  },
  infoSection: {
    padding: 16,
    paddingBottom: 32,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoBullet: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bulletNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10b981",
  },
  bulletText: {
    fontSize: 14,
  },
});
