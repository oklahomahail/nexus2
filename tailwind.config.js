// tailwind.config.js - Updated for Nexus Platform unified design system
const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        // Brand colors using CSS custom properties
        brand: {
          primary: "rgb(var(--brand-primary) / <alpha-value>)",
          secondary: "rgb(var(--brand-secondary) / <alpha-value>)",
          accent: "rgb(var(--brand-accent) / <alpha-value>)",
          dark: "rgb(var(--text-inverse) / <alpha-value>)",
          muted: "rgb(var(--surface-muted) / <alpha-value>)",
        },
        // Background colors
        bg: {
          primary: "rgb(var(--bg-primary) / <alpha-value>)",
          secondary: "rgb(var(--bg-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--bg-tertiary) / <alpha-value>)",
        },
        // Surface colors for cards and panels
        surface: {
          DEFAULT: "rgb(var(--surface-primary) / <alpha-value>)",
          elevated: "rgb(var(--surface-secondary) / <alpha-value>)",
          muted: "rgb(var(--surface-muted) / <alpha-value>)",
        },
        // Border colors
        border: {
          DEFAULT: "rgb(var(--border-primary) / <alpha-value>)",
          muted: "rgb(var(--border-muted) / <alpha-value>)",
        },
        // Text colors
        text: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
          inverse: "rgb(var(--text-inverse) / <alpha-value>)",
        },
        // Status colors
        success: "rgb(var(--success) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        error: "rgb(var(--error) / <alpha-value>)",
        info: "rgb(var(--info) / <alpha-value>)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          ...fontFamily.sans,
        ],
        mono: ["JetBrains Mono", "Fira Code", ...fontFamily.mono],
      },
      fontSize: {
        display: ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        h1: ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        h2: ["1.875rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        h3: ["1.5rem", { lineHeight: "1.4", letterSpacing: "-0.005em" }],
        h4: ["1.25rem", { lineHeight: "1.4", letterSpacing: "-0.005em" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        body: ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
        caption: ["0.75rem", { lineHeight: "1.4" }],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      boxShadow: {
        soft: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px 0 rgb(0 0 0 / 0.06)",
        medium:
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)",
        strong:
          "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)",
        glow: "0 0 20px rgb(var(--brand-primary) / 0.3)",
        "glow-lg": "0 0 40px rgb(var(--brand-primary) / 0.2)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: {
            opacity: "0",
            transform: "translateY(10px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        scaleIn: {
          from: {
            opacity: "0",
            transform: "scale(0.95)",
          },
          to: {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      screens: {
        xs: "475px",
        "3xl": "1600px",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
