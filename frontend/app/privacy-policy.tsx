import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { colors } = useTheme();

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
            <Text style={styles.headerTitle}>Privacy Policy</Text>
            <View style={{ width: 24 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          1. Information We Collect
        </Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          We collect information you provide directly to us, such as when you
          create or modify your account, request services, contact customer
          support, or otherwise communicate with us. This information may
          include: name, email, phone number, and profile picture.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          2. Location Information
        </Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          When you use our services, we collect precise location data about the
          journey primarily to help you find nearby charging stations. If you
          permit the app to access location services through the permission
          system used by your mobile operating system, we may also collect the
          precise location of your device when the app is running in the
          foreground or background.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          3. Use of Information
        </Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          We use the information we collect to provide, maintain, and improve
          our services, including to facilitate payments, send receipts, provide
          products and services you request (and send related information),
          develop new features, provide customer support to Users and Drivers,
          and send product updates and administrative messages.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          4. Sharing of Information
        </Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          We may share the information we collect about you as described in this
          Statement or as described at the time of collection or sharing,
          including as follows: with third party service providers to enable
          them to provide the services you request.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  content: { padding: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
});
