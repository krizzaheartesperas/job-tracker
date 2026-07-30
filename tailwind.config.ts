import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#F6F7FB",
        surface: "#FFFFFF",
        surfaceMuted: "#EEF0F6",
        ink: "#14161F",
        inkSoft: "#6B7086",
        border: "#E5E7F0",
        brand: "#5B5FEF",
        brandSoft: "#EEEEFE",
        brand2: "#14B8A6",
        brand2Soft: "#DFF7F3",
        amber: "#F5A524",
        amberSoft: "#FDF0DA",
        red: "#EF4444",
        redSoft: "#FDEBEB",
      },
      fontFamily: {
        display: ["var(--font-space)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "20px",
        xl: "28px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(20, 22, 31, 0.04), 0 8px 24px -8px rgba(20, 22, 31, 0.08)",
        softLg: "0 4px 12px rgba(20, 22, 31, 0.05), 0 24px 48px -16px rgba(20, 22, 31, 0.14)",
        glow: "0 0 0 1px rgba(91, 95, 239, 0.08), 0 8px 24px -6px rgba(91, 95, 239, 0.35)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #5B5FEF 0%, #8B5CF6 55%, #14B8A6 100%)",
        "mesh": "radial-gradient(60% 50% at 20% 20%, rgba(91,95,239,0.35), transparent 60%), radial-gradient(50% 40% at 85% 15%, rgba(20,184,166,0.30), transparent 60%), radial-gradient(60% 50% at 50% 100%, rgba(139,92,246,0.25), transparent 60%)",
      },
      keyframes: {
        "popup-in": {
          "0%": { opacity: "0", transform: "scale(0.7) translateY(20px)" },
          "60%": { opacity: "1", transform: "scale(1.05) translateY(-4px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "popup-out": {
          "0%": { opacity: "1", transform: "scale(1) translateY(0)" },
          "100%": { opacity: "0", transform: "scale(0.9) translateY(10px)" },
        },
        "mascot-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "wave-arm": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-18deg)" },
          "75%": { transform: "rotate(12deg)" },
        },
        "sparkle": {
          "0%, 100%": { opacity: "0.3", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
        "shadow-pulse": {
          "0%, 100%": { transform: "scaleX(1)", opacity: "0.08" },
          "50%": { transform: "scaleX(0.85)", opacity: "0.05" },
        },
        "flag-wave": {
          "0%, 100%": { transform: "skewY(0deg)" },
          "50%": { transform: "skewY(6deg)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "popup-in": "popup-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "popup-out": "popup-out 0.3s ease-in forwards",
        "mascot-bounce": "mascot-bounce 2s ease-in-out infinite",
        "wave-arm": "wave-arm 1.2s ease-in-out infinite",
        "sparkle": "sparkle 2s ease-in-out infinite",
        "shadow-pulse": "shadow-pulse 2s ease-in-out infinite",
        "flag-wave": "flag-wave 1.5s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
