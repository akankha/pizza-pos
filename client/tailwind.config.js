/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Modern professional palette for North American POS
        brand: {
          primary: "#FF6B35", // Vibrant coral-orange (main CTA)
          secondary: "#004E89", // Deep blue (trust, professionalism)
          accent: "#F7931E", // Warm orange (highlights)
          success: "#10B981", // Modern green (success states)
          warning: "#F59E0B", // Amber (warnings)
          danger: "#EF4444", // Red (errors, delete)
          dark: "#1E293B", // Slate dark (headers, text)
          light: "#F8FAFC", // Off-white (backgrounds)
        },
        // Legacy pizza colors for backward compatibility
        pizza: {
          red: "#FF6B35",
          "red-dark": "#E85D2A",
          orange: "#F7931E",
          "orange-light": "#FFB84D",
          cream: "#FFF8F0",
          brown: "#5D4037",
          green: "#10B981",
          gold: "#F59E0B",
        },
        // Enhanced dark mode palette
        dark: {
          bg: {
            primary: "#0F172A", // Deep slate background
            secondary: "#1E293B", // Elevated surfaces
            tertiary: "#334155", // Cards and components
            elevated: "#475569", // Hover states
          },
          text: {
            primary: "#F1F5F9", // Main text
            secondary: "#CBD5E1", // Secondary text
            tertiary: "#94A3B8", // Muted text
            disabled: "#64748B", // Disabled text
          },
          border: {
            primary: "#334155", // Primary borders
            secondary: "#475569", // Hover borders
            focus: "#FF8A5B", // Focus state (lighter orange)
          },
        },
      },
      fontSize: {
        // Touch-optimized typography
        touch: ["1.125rem", { lineHeight: "1.5" }], // 18px
        "touch-lg": ["1.375rem", { lineHeight: "1.5" }], // 22px
        "touch-xl": ["1.75rem", { lineHeight: "1.4" }], // 28px
        "touch-2xl": ["2.25rem", { lineHeight: "1.3" }], // 36px
      },
      minHeight: {
        touch: "56px", // Minimum 56px for touch targets
        "touch-lg": "64px", // Larger touch targets
        "touch-xl": "72px", // Extra large touch targets
      },
      minWidth: {
        touch: "56px",
        "touch-lg": "64px",
        "touch-xl": "72px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.08)",
        medium: "0 4px 16px rgba(0, 0, 0, 0.12)",
        hard: "0 8px 24px rgba(0, 0, 0, 0.16)",
        touch: "0 2px 12px rgba(0, 0, 0, 0.1)",
      },
      borderRadius: {
        touch: "12px",
        card: "16px",
      },
      borderWidth: {
        3: "3px",
      },
    },
  },
  plugins: [],
};
