import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Zap } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { Alert } from "react-native";
import { api } from "@/services/api";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Zap size={40} color="#fff" strokeWidth={2} />
        </View>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue charging</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="john@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View
              style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
            />
            <Text style={styles.checkboxLabel}>Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(auth)/recovery")}>
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={async () => {
            if (!email || !password) {
              Alert.alert("Error", "Please fill in all fields");
              return;
            }
            try {
              await signIn(email, password);
              // Navigate to tabs on success
              router.replace("/(tabs)");
            } catch (error: any) {
              console.log("Login Error:", error);
              // Show more detail if available to help debugging
              const errorMessage =
                error.message || "An error occurred during login";
              // If it's a network error, give a hint
              if (errorMessage.includes("Network request failed")) {
                Alert.alert(
                  "Connection Error",
                  `Could not connect to server.\n\nMake sure the backend is running and your device is on the same network.\n\nError: ${errorMessage}`,
                );
              } else {
                Alert.alert("Login Failed", errorMessage);
              }
            }
          }}
        >
          <Text style={styles.submitButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>Or continue with</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.socialButtons}>
        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>Facebook</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Don't have an account?{" "}
        <Text
          style={styles.link}
          onPress={() => router.push("/(auth)/register")}
        >
          Sign Up
        </Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 24,
    justifyContent: "center",
    minHeight: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: "#10b981",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
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
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 4,
  },
  checkboxChecked: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  link: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#10b981",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#d1d5db",
  },
  dividerText: {
    paddingHorizontal: 8,
    fontSize: 14,
    color: "#9ca3af",
  },
  socialButtons: {
    flexDirection: "row",
    gap: 12,
  },
  socialButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  footer: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 24,
  },
});
