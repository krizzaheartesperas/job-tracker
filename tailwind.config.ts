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
    },
  },
  plugins: [],
};
export default config;
