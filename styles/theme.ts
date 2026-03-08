/**
 * Theme system - CSS variables mapped to JavaScript
 * Works on both web and native
 */

// Color palettes (Tailwind-inspired)
export const colors = {
  // Red - bold, powerful
  red: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },

  // Orange - warm, energetic
  orange: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
  },

  // Green - nature, growth
  green: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },

  // Blue - professional, calm
  blue: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },

  // Violet - creative, mystical
  violet: {
    50: "#f5f3ff",
    100: "#ede9fe",
    200: "#ddd6fe",
    300: "#c4b5fd",
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
    800: "#5b21b6",
    900: "#4c1d95",
  },

  // Purple - luxury, innovation
  purple: {
    50: "#faf5ff",
    100: "#f3e8ff",
    200: "#e9d5ff",
    300: "#d8b4fe",
    400: "#c084fc",
    500: "#a855f7",
    600: "#9333ea",
    700: "#7e22ce",
    800: "#6b21a8",
    900: "#581c87",
  },

  // Gray shades
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
} as const

// Light theme
export const lightTheme = {
  overlay: "rgba(0, 0, 0, 0.1)",
  foreground: "#000",
  background: "#fff",

  // Accent colors (default)
  accent0: colors.red[500],
  accent1: colors.orange[500],
  accent2: "#84cc16", // lime-500
  accent3: colors.green[500],
  accent4: "#10b981", // emerald-500
  accent5: "#06b6d4", // cyan-500
  accent6: colors.blue[500],
  accent7: colors.purple[500],
  accent8: "#ec4899", // pink-500

  // Shades
  shade1: colors.gray[50],
  shade2: colors.gray[200],
  shade3: colors.gray[400],
  shade4: colors.gray[500],
  shade5: colors.gray[600],
  shade6: colors.gray[700],
  shade7: colors.gray[800],
  shade8: colors.gray[900],

  // Transparent variants
  shade1Transparent: "rgba(249, 250, 251, 0.9)",
  shade2Transparent: "rgba(229, 231, 235, 0.8)",
  shade3Transparent: "rgba(156, 163, 175, 0.8)",
  backgroundTransparent: "rgba(255, 255, 255, 0.8)",

  // Semantic colors
  selection: "#84cc16",
  linkColor: colors.blue[500],

  // Effects
  shadow: "0 3px 25px rgba(0, 0, 0, 0.16)",
  shadowGlow: "0 0 15px hsl(120 60% 50% / 0.3)",

  // Layout
  radius: 20,
} as const

// Dark theme
export const darkTheme = {
  overlay: "rgba(255, 255, 255, 0.1)",
  foreground: "#fff",
  background: "#000",

  // Accent colors (same as light)
  accent0: colors.red[500],
  accent1: colors.orange[500],
  accent2: "#84cc16",
  accent3: colors.green[500],
  accent4: "#10b981",
  accent5: "#06b6d4",
  accent6: colors.blue[500],
  accent7: colors.purple[500],
  accent8: "#ec4899",

  // Shades (inverted)
  shade8: colors.gray[50],
  shade7: colors.gray[200],
  shade6: colors.gray[400],
  shade5: colors.gray[500],
  shade4: colors.gray[600],
  shade3: colors.gray[700],
  shade2: colors.gray[800],
  shade1: colors.gray[900],

  // Transparent variants
  shade1Transparent: "rgba(17, 24, 39, 0.8)",
  shade2Transparent: "rgba(31, 41, 55, 0.8)",
  shade3Transparent: "rgba(55, 65, 81, 0.8)",
  backgroundTransparent: "rgba(0, 0, 0, 0.8)",

  // Semantic colors
  selection: colors.purple[500],
  linkColor: colors.blue[500],

  // Effects
  shadow: "0 3px 25px rgba(0, 0, 0, 0.16)",
  shadowGlow: "0 0 30px hsl(120 60% 50% / 0.3)",

  // Layout
  radius: 20,
} as const

export type Theme = typeof lightTheme | typeof darkTheme

// Hook to get current theme
export const useTheme = (): Theme => {
  // Check if dark mode is enabled
  // Default to dark theme on server (SSR) to match most users' preference
  // and reduce hydration mismatches
  const isDark =
    typeof window === "undefined" || // Server-side: default to dark
    typeof document === "undefined" || // Server-side: default to dark
    window.matchMedia?.("(prefers-color-scheme: dark)").matches ||
    document.documentElement?.classList?.contains("dark") ||
    document.documentElement?.style?.colorScheme === "dark"

  return isDark ? darkTheme : lightTheme
}

// Helper to get CSS variable value (fallback for web)
export const getCSSVar = (varName: string, fallback?: string): string => {
  if (typeof window === "undefined") return fallback || ""

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim()

  return value || fallback || ""
}

// Helper to use theme color with CSS var fallback
export const useThemeColor = (colorKey: keyof Theme): string => {
  const theme = useTheme()
  return theme[colorKey] as string
}

// Map CSS variable names to theme keys
const cssVarToThemeKey: Record<string, keyof Theme> = {
  "--foreground": "foreground",
  "--background": "background",
  "--overlay": "overlay",
  "--shade-1": "shade1",
  "--shade-2": "shade2",
  "--shade-3": "shade3",
  "--shade-4": "shade4",
  "--shade-5": "shade5",
  "--shade-6": "shade6",
  "--shade-7": "shade7",
  "--shade-8": "shade8",
  "--accent-0": "accent0",
  "--accent-1": "accent1",
  "--accent-2": "accent2",
  "--accent-3": "accent3",
  "--accent-4": "accent4",
  "--accent-5": "accent5",
  "--accent-6": "accent6",
  "--accent-7": "accent7",
  "--accent-8": "accent8",
  "--link-color": "linkColor",
  "--selection": "selection",
  "--shadow": "shadow",
  "--shadow-glow": "shadowGlow",
  "--radius": "radius",
}

/**
 * Resolve CSS variable to theme value
 * For web: returns the CSS var as-is
 * For native: returns the actual color value from theme
 */
export function resolveCssVar(
  value: string,
  theme: Theme,
  isWeb: boolean = true,
): string {
  if (!value || typeof value !== "string") return value

  // If it's not a CSS variable, return as-is
  if (!value.includes("var(--")) return value

  // For web, keep CSS variables
  if (isWeb) return value

  // For native, resolve to actual values
  const varMatch = value.match(/var\((--[a-z0-9-]+)\)/)
  if (varMatch?.[1]) {
    const themeKey = cssVarToThemeKey[varMatch[1]]
    if (themeKey && theme[themeKey]) {
      return String(theme[themeKey])
    }
  }

  return value
}

/**
 * Resolve all CSS variables in a style object
 * For React Native support
 */
export function resolveStyleVars(
  style: Record<string, any>,
  theme: Theme,
  isWeb: boolean = true,
): Record<string, any> {
  if (!style || typeof style !== "object") return style

  const resolved: Record<string, any> = {}

  for (const [key, value] of Object.entries(style)) {
    if (typeof value === "string") {
      resolved[key] = resolveCssVar(value, theme, isWeb)
    } else if (typeof value === "object" && value !== null) {
      resolved[key] = resolveStyleVars(value, theme, isWeb)
    } else {
      resolved[key] = value
    }
  }

  return resolved
}
