import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      colors: {
        border: "hsl(var(--border))",
        neon: "hsl(var(--neon))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "blob-morph": {
          "0%, 100%": { borderRadius: "62% 38% 44% 56% / 54% 48% 52% 46%" },
          "25%": { borderRadius: "38% 62% 63% 37% / 41% 62% 38% 59%" },
          "50%": { borderRadius: "54% 46% 33% 67% / 63% 35% 65% 37%" },
          "75%": { borderRadius: "45% 55% 58% 42% / 36% 57% 43% 64%" },
        },
        "blob-spin": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "blob-breathe": {
          "0%, 100%": { transform: "scale(0.94)" },
          "35%": { transform: "scale(1.14)" },
          "70%": { transform: "scale(1.02)" },
        },
        "blob-hue": {
          "0%, 100%": { filter: "hue-rotate(0deg) saturate(1)" },
          "33%": { filter: "hue-rotate(176deg) saturate(1.15)" },
          "66%": { filter: "hue-rotate(226deg) saturate(1.05)" },
        },
        "blob-sheen": {
          "0%, 100%": { transform: "translate3d(-18%, -22%, 0) scale(1)" },
          "33%": { transform: "translate3d(16%, -6%, 0) scale(1.18)" },
          "66%": { transform: "translate3d(-4%, 18%, 0) scale(0.92)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "blob-morph": "blob-morph 8s ease-in-out infinite",
        "blob-spin": "blob-spin 18s linear infinite",
        "blob-sheen": "blob-sheen 7s ease-in-out infinite",
        "blob-breathe": "blob-breathe 6s ease-in-out infinite",
        "blob-hue": "blob-hue 12s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

export default config;
