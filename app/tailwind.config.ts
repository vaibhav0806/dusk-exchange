import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core palette - Deep charcoal with cyan accents
        dusk: {
          950: "#05080a",
          900: "#0a1014",
          850: "#0d1419",
          800: "#111a20",
          700: "#1a262e",
          600: "#253440",
          500: "#3a4d5c",
          400: "#5a7285",
          300: "#8da3b4",
        },
        // Electric cyan - the "encrypted data" accent
        cipher: {
          500: "#00d4aa",
          400: "#00f0c0",
          300: "#5fffd7",
          glow: "rgba(0, 212, 170, 0.15)",
        },
        // Buy/Sell colors
        bull: {
          500: "#00c853",
          400: "#00e676",
          glow: "rgba(0, 200, 83, 0.12)",
        },
        bear: {
          500: "#ff1744",
          400: "#ff5252",
          glow: "rgba(255, 23, 68, 0.12)",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(0, 212, 170, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 170, 0.03) 1px, transparent 1px)",
        "noise-texture": "url('/noise.svg')",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      backgroundSize: {
        grid: "24px 24px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 212, 170, 0.15)",
        "glow-lg": "0 0 40px rgba(0, 212, 170, 0.2)",
        "inner-glow": "inset 0 0 20px rgba(0, 212, 170, 0.05)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
