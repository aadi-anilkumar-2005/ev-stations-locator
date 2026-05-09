import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { useAuth } from "./AuthContext";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: {
    background: string;
    text: string;
    textSecondary: string;
    card: string;
    border: string;
    primary: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const lightColors = {
  background: "#f3f4f6",
  text: "#1f2937",
  textSecondary: "#6b7280",
  card: "#ffffff",
  border: "#e5e7eb",
  primary: "#10b981",
};

export const darkColors = {
  background: "#111827",
  text: "#f9fafb",
  textSecondary: "#9ca3af",
  card: "#1f2937",
  border: "#374151",
  primary: "#10b981",
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const { user, refreshUser } = useAuth();

  // Initialize with system preference or user preference if available
  const [theme, setTheme] = useState<Theme>(
    systemScheme === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    if (user && user.preferences) {
      setTheme(user.preferences.is_dark_mode ? "dark" : "light");
    }
  }, [user]);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    // Persist to backend if user is logged in
    // Note: implementation handled by the consumer calling api.updateProfile usually,
    // but we can just let usage inside settings.tsx handle the API call.
    // However, for immediate local effect, we update state here.
  };

  const colors = theme === "dark" ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
