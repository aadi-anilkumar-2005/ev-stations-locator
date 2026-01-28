import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Camera, User, Mail, Phone } from "lucide-react-native";
import { useRouter } from "expo-router";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function EditProfileScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { colors, theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // User Data State
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = await api.getProfile();
      setForm({
        fullName:
          user.full_name || `${user.first_name} ${user.last_name}`.trim(),
        email: user.email || "",
        phone: user.profile?.phone_number || "",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Prepare payload: direct fields for user, nested for profile
      const payload = {
        full_name: form.fullName,
        profile: {
          phone_number: form.phone,
        },
      };
      await api.updateProfile(payload);
      await refreshUser(); // Refresh global user state
      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.background,
          },
        ]}
      >
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

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
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSave} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: "https://via.placeholder.com/150" }}
                style={[styles.avatar, { borderColor: colors.card }]}
              />
              <TouchableOpacity style={styles.cameraBtn}>
                <Camera size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </View>

          {/* Form Section */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Full Name
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <User size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={form.fullName}
                  onChangeText={(t) => setForm({ ...form, fullName: t })}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Email Address
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  styles.disabledInput,
                  {
                    borderColor: colors.border,
                    backgroundColor: theme === "dark" ? "#1f2937" : "#f3f4f6",
                  },
                ]}
              >
                <Mail size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.textSecondary }]}
                  value={form.email}
                  editable={false}
                />
              </View>
              <Text
                style={[styles.helperText, { color: colors.textSecondary }]}
              >
                Email cannot be changed
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Phone Number
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Phone size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={form.phone}
                  onChangeText={(t) => setForm({ ...form, phone: t })}
                  keyboardType="phone-pad"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  content: { padding: 20 },
  avatarSection: { alignItems: "center", marginVertical: 20 },
  avatarContainer: { position: "relative" },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e5e7eb",
    borderWidth: 4,
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#10b981",
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#fff",
  },
  changePhotoText: { marginTop: 12, color: "#10b981", fontWeight: "600" },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    gap: 12,
  },
  input: { flex: 1, fontSize: 16 },
  disabledInput: {},
  helperText: { fontSize: 12, marginLeft: 4 },
});
