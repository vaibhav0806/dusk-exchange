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
        // Deep, rich dark palette with warm undertones
        background: "hsl(220 16% 4%)",
        surface: {
          DEFAULT: "hsl(220 14% 6%)",
          elevated: "hsl(220 12% 9%)",
          overlay: "hsl(220 12% 12%)",
          hover: "hsl(220 12% 11%)",
        },
        border: {
          DEFAULT: "hsl(220 10% 18%)",
          subtle: "hsl(220 10% 13%)",
          strong: "hsl(220 10% 24%)",
          accent: "hsl(38 95% 54% / 0.3)",
        },
        // Refined text hierarchy
        text: {
          primary: "hsl(40 10% 95%)",
          secondary: "hsl(220 8% 60%)",
          tertiary: "hsl(220 8% 42%)",
          muted: "hsl(220 6% 28%)",
        },
        // Premium amber/gold accent - institutional, sophisticated
        accent: {
          DEFAULT: "hsl(38 95% 54%)",
          bright: "hsl(38 100% 60%)",
          muted: "hsl(38 70% 42%)",
          subtle: "hsl(38 95% 54% / 0.08)",
          hover: "hsl(38 95% 54% / 0.12)",
        },
        // Semantic colors - refined for financial data
        success: {
          DEFAULT: "hsl(152 60% 48%)",
          bright: "hsl(152 70% 55%)",
          muted: "hsl(152 45% 38%)",
          subtle: "hsl(152 60% 48% / 0.1)",
        },
        danger: {
          DEFAULT: "hsl(0 72% 58%)",
          bright: "hsl(0 80% 65%)",
          muted: "hsl(0 55% 45%)",
          subtle: "hsl(0 72% 58% / 0.1)",
        },
        warning: {
          DEFAULT: "hsl(45 90% 50%)",
          subtle: "hsl(45 90% 50% / 0.1)",
        },
      },
      fontFamily: {
        sans: ["Geist", "system-ui", "sans-serif"],
        display: ["Geist", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "JetBrains Mono", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        "xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "18": "4.5rem",
      },
      borderRadius: {
        "lg": "0.625rem",
        "xl": "0.75rem",
        "2xl": "0.875rem",
        "3xl": "1rem",
      },
      boxShadow: {
        "soft": "0 2px 8px -2px hsl(220 20% 4% / 0.6)",
        "medium": "0 4px 20px -4px hsl(220 20% 4% / 0.7)",
        "strong": "0 12px 40px -8px hsl(220 20% 4% / 0.8)",
        "glow-accent": "0 0 24px -4px hsl(38 95% 54% / 0.25)",
        "glow-success": "0 0 20px -4px hsl(152 60% 48% / 0.25)",
        "glow-danger": "0 0 20px -4px hsl(0 72% 58% / 0.25)",
        "inner-highlight": "inset 0 1px 0 0 hsl(220 10% 18% / 0.5)",
        "card": "0 1px 3px 0 hsl(220 20% 4% / 0.4), 0 0 0 1px hsl(220 10% 13%)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-card": "linear-gradient(180deg, hsl(220 12% 8%) 0%, hsl(220 14% 6%) 100%)",
        "gradient-accent": "linear-gradient(135deg, hsl(38 95% 54%) 0%, hsl(38 80% 45%) 100%)",
        "shimmer": "linear-gradient(90deg, transparent 0%, hsl(38 95% 54% / 0.06) 50%, transparent 100%)",
      },
      animation: {
        "shimmer": "shimmer 2.5s ease-in-out infinite",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "fade-in": "fade-in 0.2s ease-out forwards",
        "slide-up": "slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-down": "slide-down 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scale-in 0.15s ease-out forwards",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 16px -4px hsl(38 95% 54% / 0.3)" },
          "50%": { boxShadow: "0 0 24px -4px hsl(38 95% 54% / 0.5)" },
        },
      },
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.16, 1, 0.3, 1)",
        "bounce": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
