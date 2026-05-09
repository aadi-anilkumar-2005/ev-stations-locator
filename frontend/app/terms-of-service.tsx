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

export default function TermsOfServiceScreen() {
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
            <Text style={styles.headerTitle}>Terms of Service</Text>
            <View style={{ width: 24 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
          Last Updated: January 2026
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          1. Agreement to Terms
        </Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          By accessing or using our services, you agree to be bound by these
          Terms of Service and our Privacy Policy. If you do not agree to these
          terms, do not use our services.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          2. Use of Service
        </Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          You are responsible for your use of the Service and for any
          consequences thereof. You may use the Service only if you can form a
          binding contract with us and are not a person barred from receiving
          services under the laws of the applicable jurisdiction.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          3. User Accounts
        </Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          You may need to create an account to use some of our Services. You are
          responsible for safeguarding your account, so use a strong password
          and limit its use to this account. We cannot and will not be liable
          for any loss or damage arising from your failure to comply with the
          above.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          4. Termination
        </Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          We may terminate or suspend access to our Service immediately, without
          prior notice or liability, for any reason whatsoever, including
          without limitation if you breach the Terms.
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
  lastUpdated: {
    fontSize: 14,
    marginBottom: 20,
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
});
