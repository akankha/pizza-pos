import React, { createContext, useContext, useEffect, useState } from "react";
import { apiUrl } from "../utils/api";

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dark mode setting from server
    fetchDarkModeSetting();
  }, []);

  const fetchDarkModeSetting = async () => {
    try {
      const response = await fetch(apiUrl("/api/settings"));
      const result = await response.json();
      console.log("Theme settings fetched:", result);
      if (result.success && result.data) {
        const isDark =
          result.data.dark_mode === 1 || result.data.dark_mode === true;
        console.log("Applying dark mode:", isDark);
        setDarkMode(isDark);
        applyTheme(isDark);
      }
    } catch (error) {
      console.error("Failed to fetch theme setting:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    applyTheme(newDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
