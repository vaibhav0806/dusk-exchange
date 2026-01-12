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
        // Refined dark palette
        surface: {
          DEFAULT: "hsl(210 18% 7%)",
          elevated: "hsl(210 16% 10%)",
          overlay: "hsl(210 18% 12%)",
        },
        border: {
          DEFAULT: "hsl(210 15% 15%)",
          subtle: "hsl(210 15% 12%)",
          strong: "hsl(210 15% 20%)",
        },
        // Text hierarchy
        text: {
          primary: "hsl(210 20% 93%)",
          secondary: "hsl(210 15% 65%)",
          tertiary: "hsl(210 12% 45%)",
          muted: "hsl(210 10% 35%)",
        },
        // Brand accent - sophisticated teal
        accent: {
          DEFAULT: "hsl(158 100% 41%)",
          muted: "hsl(158 60% 35%)",
          bright: "hsl(158 100% 50%)",
          subtle: "hsl(158 100% 41% / 0.1)",
        },
        // Semantic colors
        success: {
          DEFAULT: "hsl(145 63% 49%)",
          muted: "hsl(145 50% 40%)",
          subtle: "hsl(145 63% 49% / 0.1)",
        },
        danger: {
          DEFAULT: "hsl(0 84% 60%)",
          muted: "hsl(0 70% 50%)",
          subtle: "hsl(0 84% 60% / 0.1)",
        },
        warning: {
          DEFAULT: "hsl(38 92% 50%)",
          subtle: "hsl(38 92% 50% / 0.1)",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "Menlo", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
      },
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
      boxShadow: {
        "glow-sm": "0 0 12px -3px hsl(158 100% 41% / 0.2)",
        "glow": "0 0 24px -6px hsl(158 100% 41% / 0.3)",
        "glow-lg": "0 0 40px -8px hsl(158 100% 41% / 0.3)",
        "glow-success": "0 0 20px -6px hsl(145 63% 49% / 0.3)",
        "glow-danger": "0 0 20px -6px hsl(0 84% 60% / 0.3)",
        "elevation-1": "0 2px 8px -2px hsl(210 30% 5% / 0.3)",
        "elevation-2": "0 4px 16px -4px hsl(210 30% 5% / 0.4)",
        "elevation-3": "0 8px 32px -8px hsl(210 30% 5% / 0.5)",
        "inner-glow": "inset 0 1px 0 hsl(210 15% 20% / 0.1)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-subtle": "linear-gradient(135deg, var(--tw-gradient-stops))",
      },
      animation: {
        "shimmer": "shimmer 3s ease-in-out infinite",
        "pulse-subtle": "pulse-subtle 3s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "slide-up": "slide-up 0.3s ease-out forwards",
        "slide-down": "slide-down 0.3s ease-out forwards",
        "scale-in": "scale-in 0.2s ease-out forwards",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "100% 0" },
          "100%": { backgroundPosition: "-100% 0" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
