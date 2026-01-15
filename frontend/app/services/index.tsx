import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Store, Wrench, Zap } from "lucide-react-native";

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
    {
      id: "battery",
      icon: Zap,
      title: "Battery Shops",
      subtitle: "Battery Solutions",
      description: "Buy and replace EV batteries with warranty",
      color: "#ec4899",
      bgColor: "#fce7f3",
      count: "6 nearby",
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>EV Services</Text>
        <Text style={styles.subtitle}>
          Find everything for your electric vehicle
        </Text>
      </View>

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
              else router.push("/services/battery-shops");
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
            <Text style={styles.serviceDescription}>{service.description}</Text>
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

        <TouchableOpacity
          style={styles.quickAccessCard}
          onPress={() => router.push("/services/battery-shops")}
        >
          <View style={styles.quickAccessIcon}>
            <Zap size={24} color="#ec4899" strokeWidth={2} />
          </View>
          <View style={styles.quickAccessContent}>
            <Text style={styles.quickAccessTitle}>Battery Replacement</Text>
            <Text style={styles.quickAccessSubtitle}>
              Find genuine batteries with warranty
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#fff",
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
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
