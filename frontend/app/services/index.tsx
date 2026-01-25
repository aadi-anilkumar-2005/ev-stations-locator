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

export default function ServicesScreen() {
  const router = useRouter();

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
            <Text style={styles.headerTitle}>EV Services</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageSubtitle}>
          Find everything for your electric vehicle
        </Text>

        <View style={styles.servicesGrid}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceCard}
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
                  { backgroundColor: service.bgColor },
                ]}
              >
                <service.icon size={40} color={service.color} strokeWidth={2} />
              </View>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
              <Text style={styles.serviceDescription}>
                {service.description}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.countBadge}>{service.count}</Text>
                <Text style={styles.arrow}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.quickAccessSection}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <TouchableOpacity
            style={styles.quickAccessCard}
            onPress={() => router.push("/services/showrooms")}
          >
            <View style={styles.quickAccessIcon}>
              <Store size={24} color="#3b82f6" strokeWidth={2} />
            </View>
            <View style={styles.quickAccessContent}>
              <Text style={styles.quickAccessTitle}>Latest EV Models</Text>
              <Text style={styles.quickAccessSubtitle}>
                Explore 2024-2025 models at showrooms
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAccessCard}
            onPress={() => router.push("/services/service-stations")}
          >
            <View style={styles.quickAccessIcon}>
              <Wrench size={24} color="#f59e0b" strokeWidth={2} />
            </View>
            <View style={styles.quickAccessContent}>
              <Text style={styles.quickAccessTitle}>Regular Maintenance</Text>
              <Text style={styles.quickAccessSubtitle}>
                Schedule your EV check-up today
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Why Choose Our Services?</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoBullet}>
              <Text style={styles.bulletNumber}>✓</Text>
              <Text style={styles.bulletText}>Certified EV Specialists</Text>
            </View>
            <View style={styles.infoBullet}>
              <Text style={styles.bulletNumber}>✓</Text>
              <Text style={styles.bulletText}>Genuine Parts & Warranty</Text>
            </View>
            <View style={styles.infoBullet}>
              <Text style={styles.bulletNumber}>✓</Text>
              <Text style={styles.bulletText}>Fast & Reliable Service</Text>
            </View>
            <View style={styles.infoBullet}>
              <Text style={styles.bulletNumber}>✓</Text>
              <Text style={styles.bulletText}>Competitive Pricing</Text>
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
    backgroundColor: "#f9fafb",
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
    color: "#6b7280",
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
    backgroundColor: "#fff",
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
    color: "#111",
    marginBottom: 4,
  },
  serviceSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 12,
    color: "#9ca3af",
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
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  arrow: {
    fontSize: 16,
    color: "#d1d5db",
  },
  quickAccessSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 12,
  },
  quickAccessCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
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
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
  },
  quickAccessContent: {
    flex: 1,
  },
  quickAccessTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    marginBottom: 2,
  },
  quickAccessSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  infoSection: {
    padding: 16,
    paddingBottom: 32,
  },
  infoCard: {
    backgroundColor: "#fff",
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
    color: "#374151",
  },
});
