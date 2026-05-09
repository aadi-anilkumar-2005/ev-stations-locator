import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

const FAQS = [
  {
    question: "How do I start a charging session?",
    answer:
      "Scan the QR code on the charging station using the 'Scan' tab in the app. Connect the plug to your vehicle and tap 'Start Charging'.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept all major credit/debit cards, UPI, and net banking. You can manage your methods in the Wallet section.",
  },
  {
    question: "How do I filter stations for my car?",
    answer:
      "Go to your Profile > My Vehicle to add your car details. The map will automatically show compatible stations.",
  },
  {
    question: "My transaction failed but money was deducted.",
    answer:
      "Don't worry! Failed transaction amounts are automatically refunded within 3-5 business days. Contact support if it takes longer.",
  },
];

export default function HelpSupportScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleContact = (type: string) => {
    if (type === "call") Linking.openURL("tel:+911234567890");
    if (type === "mail") Linking.openURL("mailto:support@evfinder.com");
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
            <Text style={styles.headerTitle}>Help & Support</Text>
            <View style={{ width: 24 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Contact Us
          </Text>
          <View style={styles.contactRow}>
            <TouchableOpacity
              style={[styles.contactCard, { backgroundColor: colors.card }]}
              onPress={() => handleContact("call")}
            >
              <View style={[styles.iconBg, { backgroundColor: "#e0f2fe" }]}>
                <Phone size={24} color="#0284c7" />
              </View>
              <Text style={[styles.contactLabel, { color: colors.text }]}>
                Call Support
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactCard, { backgroundColor: colors.card }]}
              onPress={() => handleContact("mail")}
            >
              <View style={[styles.iconBg, { backgroundColor: "#f3e8ff" }]}>
                <Mail size={24} color="#9333ea" />
              </View>
              <Text style={[styles.contactLabel, { color: colors.text }]}>
                Email Us
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactCard, { backgroundColor: colors.card }]}
            >
              <View style={[styles.iconBg, { backgroundColor: "#dcfce7" }]}>
                <MessageCircle size={24} color="#16a34a" />
              </View>
              <Text style={[styles.contactLabel, { color: colors.text }]}>
                Live Chat
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Frequently Asked Questions
          </Text>
          <View style={styles.faqList}>
            {FAQS.map((faq, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.faqItem, { backgroundColor: colors.card }]}
                activeOpacity={0.8}
                onPress={() => toggleExpand(index)}
              >
                <View style={styles.faqHeader}>
                  <Text style={[styles.faqQuestion, { color: colors.text }]}>
                    {faq.question}
                  </Text>
                  {expandedIndex === index ? (
                    <ChevronUp size={20} color={colors.textSecondary} />
                  ) : (
                    <ChevronDown size={20} color={colors.textSecondary} />
                  )}
                </View>
                {expandedIndex === index && (
                  <Text
                    style={[styles.faqAnswer, { color: colors.textSecondary }]}
                  >
                    {faq.answer}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  contactCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    elevation: 2,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  contactLabel: { fontSize: 12, fontWeight: "600" },
  faqList: { gap: 12 },
  faqItem: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    elevation: 1,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    paddingRight: 8,
  },
  faqAnswer: { marginTop: 12, fontSize: 14, lineHeight: 20 },
});
