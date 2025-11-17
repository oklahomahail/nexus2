/**
 * Nexus Brand Color System
 * Based on BRAND_GUIDE.md (2025 Edition)
 *
 * Use these constants for consistent brand colors across the application.
 * See: /BRAND_GUIDE.md for usage guidelines
 */

export const brandColors = {
  // Primary Brand Colors (Dark Mode)
  primary: {
    indigo: "#3B36F4", // Indigo Nexus - Core brand tone
    cyan: "#72E4FC", // Electric Cyan - Energy + optimism
    violet: "#6B4DFF", // Deep Violet - Shadow glow and hover states
  },

  // Backgrounds (Dark Mode)
  background: {
    dark: "#0D0D12", // Nexus Night - Primary background
    surface: "#1A1A22", // Slate Layer - Panels, cards, modals
    elevated: "#262631", // Elevated surfaces
  },

  // Text (Dark Mode)
  text: {
    primary: "#FFFFFF", // White - On dark surfaces
    muted: "#A0A3B1", // Zinc Gray - Secondary labels
    dimmed: "#6B6D7A", // Even more subtle text
  },

  // Semantic Colors
  semantic: {
    success: "#4ADE80", // Growth Green - Success indicators
    warning: "#FACC15", // Insight Amber - Warnings
    error: "#F87171", // Privacy Red - Errors/alerts
    info: "#60A5FA", // Blue - Informational
  },

  // Gradients
  gradients: {
    nexusGlow: "linear-gradient(135deg, #3B36F4 0%, #72E4FC 100%)",
    nexusGlowReverse: "linear-gradient(135deg, #72E4FC 0%, #3B36F4 100%)",
    darkOverlay:
      "linear-gradient(180deg, rgba(13, 13, 18, 0) 0%, rgba(13, 13, 18, 0.8) 100%)",
  },

  // UI Elements (Dark Mode)
  ui: {
    border: "#2D2D3A", // Subtle borders
    borderLight: "#3A3A4A", // Lighter borders
    hover: "#2A2A38", // Hover states
    active: "#323242", // Active states
  },

  // Light Mode Palette - Nexus Professional Light Theme
  light: {
    // Brand Colors
    blue: {
      600: "#1463FF", // Primary brand blue
      700: "#0F54D0", // Hover state
      400: "#60A5FA", // Lighter blue
    },
    gold: {
      500: "#D6B464", // Accent gold
    },
    // Neutrals
    slate: {
      50: "#F7F9FB", // Page background
      100: "#EEF2F6", // Card background
      200: "#E3E7ED", // Dividers
      300: "#D2D8E0", // Borders
      700: "#3B4754", // Primary text
      900: "#1F2933", // Headings
    },
    // Semantic
    green: {
      500: "#10B981", // Success
    },
    red: {
      500: "#EF4444", // Error/Alert
    },
  },
} as const;

// Export individual color groups for convenience
export const { primary, background, text, semantic, gradients, ui } =
  brandColors;

// Tailwind-compatible color export
export const tailwindColors = {
  // Dark mode colors
  "nexus-indigo": brandColors.primary.indigo,
  "nexus-cyan": brandColors.primary.cyan,
  "nexus-violet": brandColors.primary.violet,
  "nexus-night": brandColors.background.dark,
  "nexus-surface": brandColors.background.surface,
  "nexus-elevated": brandColors.background.elevated,
  "nexus-text": brandColors.text.primary,
  "nexus-muted": brandColors.text.muted,
  "nexus-dimmed": brandColors.text.dimmed,
  "nexus-success": brandColors.semantic.success,
  "nexus-warning": brandColors.semantic.warning,
  "nexus-error": brandColors.semantic.error,
  "nexus-info": brandColors.semantic.info,
  "nexus-border": brandColors.ui.border,

  // Light mode colors
  "nexus-blue-600": brandColors.light.blue[600],
  "nexus-blue-700": brandColors.light.blue[700],
  "nexus-blue-400": brandColors.light.blue[400],
  "nexus-gold-500": brandColors.light.gold[500],
  "nexus-slate-50": brandColors.light.slate[50],
  "nexus-slate-100": brandColors.light.slate[100],
  "nexus-slate-200": brandColors.light.slate[200],
  "nexus-slate-300": brandColors.light.slate[300],
  "nexus-slate-700": brandColors.light.slate[700],
  "nexus-slate-900": brandColors.light.slate[900],
  "nexus-green-500": brandColors.light.green[500],
  "nexus-red-500": brandColors.light.red[500],
};
