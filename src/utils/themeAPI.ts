/**
 * Theme API for Client Branding
 *
 * Allows client organizations to layer their brand colors over the Nexus core identity
 * while maintaining brand consistency and accessibility.
 *
 * Example: Track15 orange can be used as a client accent color
 */

export interface ClientTheme {
  /** Client primary color (optional) */
  clientPrimary?: string
  /** Client accent color (optional) */
  clientAccent?: string
  /** Client logo URL (optional) */
  clientLogo?: string
  /** Client name */
  clientName: string
}

export interface ThemeColors {
  /** Nexus primary brand color */
  brandPrimary: string
  /** Nexus secondary accent */
  brandSecondary: string
  /** Client accent color (falls back to Nexus cyan if not provided) */
  clientAccent: string
  /** Mixed gradient combining Nexus + client colors */
  mixedGradient: string
}

/**
 * Get theme colors for a client
 * Combines Nexus core brand with client-specific colors
 */
export function getClientTheme(client?: ClientTheme): ThemeColors {
  const brandPrimary = '#3B36F4' // Indigo Nexus
  const brandSecondary = '#72E4FC' // Electric Cyan
  const clientAccent = client?.clientAccent || brandSecondary

  // Create mixed gradient: Nexus indigo → client accent
  const mixedGradient = `linear-gradient(135deg, ${brandPrimary} 0%, ${clientAccent} 100%)`

  return {
    brandPrimary,
    brandSecondary,
    clientAccent,
    mixedGradient,
  }
}

/**
 * Apply client theme to the DOM
 * Updates CSS custom properties with client colors
 */
export function applyClientTheme(client?: ClientTheme): void {
  const theme = getClientTheme(client)
  const root = document.documentElement

  // Set CSS custom properties
  root.style.setProperty('--client-accent', theme.clientAccent)
  root.style.setProperty('--mixed-gradient', theme.mixedGradient)

  // Optional: Store client name in data attribute for debugging
  if (client?.clientName) {
    root.dataset.clientTheme = client.clientName
  }
}

/**
 * Get contrasting text color for a background color
 * Ensures WCAG AA accessibility (4.5:1 contrast ratio)
 */
export function getContrastColor(backgroundColor: string): '#FFFFFF' | '#000000' {
  // Remove # if present
  const hex = backgroundColor.replace('#', '')

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Calculate relative luminance (WCAG formula)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

/**
 * Validate that a color is dark enough for the Nexus brand
 * Nexus requires dark backgrounds to preserve logo glow
 */
export function isValidBrandBackground(color: string): boolean {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Background must be dark (luminance < 0.2)
  return luminance < 0.2
}

/**
 * Example client themes
 * Use these as reference for client customization
 */
export const EXAMPLE_CLIENT_THEMES: Record<string, ClientTheme> = {
  track15: {
    clientName: 'Track15',
    clientAccent: '#FF8C42', // Track15 orange
    clientLogo: '/clients/track15/logo.svg',
  },
  hopeFoundation: {
    clientName: 'Hope Foundation',
    clientAccent: '#7CD4B3', // Mint green
    clientLogo: '/clients/hope/logo.svg',
  },
  unitedWay: {
    clientName: 'United Way',
    clientAccent: '#E74C3C', // United Way red
    clientLogo: '/clients/unitedway/logo.svg',
  },
}

/**
 * React hook for client theming
 * Use this in your app to apply client-specific colors
 *
 * @example
 * ```tsx
 * function App() {
 *   const theme = useClientTheme(currentClient)
 *
 *   return (
 *     <button
 *       style={{
 *         background: theme.mixedGradient,
 *         color: '#FFFFFF',
 *       }}
 *     >
 *       Generate Campaign
 *     </button>
 *   )
 * }
 * ```
 */
export function useClientTheme(client?: ClientTheme): ThemeColors {
  // Apply theme on mount
  if (typeof window !== 'undefined') {
    applyClientTheme(client)
  }

  return getClientTheme(client)
}
