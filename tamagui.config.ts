import { createTamagui, createTokens } from "tamagui"

// Vex brand colors
const colors = {
  // Brand colors
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#a855f7",
  pink: "#ec4899",
  violet: "#8b5cf6",

  // Neutrals
  white: "#ffffff",
  black: "#000000",
  gray: "#6b7280",

  // Semantic colors
  background: "#ffffff",
  backgroundHover: "#f9fafb",
  color: "#111827",
  colorHover: "#374151",
  borderColor: "#e5e7eb",
  placeholderColor: "#9ca3af",
}

// Minimal tokens - no default spacing/sizing
const tokens = createTokens({
  color: colors,
  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    true: 16, // default space
    5: 20,
    6: 24,
    7: 28,
    8: 32,
  },
  size: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    true: 16, // default size
    5: 20,
    6: 24,
    7: 28,
    8: 32,
  },
  radius: {
    0: 0,
    1: 2,
    2: 4,
    3: 6,
    4: 8,
    true: 8, // default radius
    5: 12,
    6: 16,
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    true: 400, // default zIndex
    5: 500,
  },
})

const appConfig = createTamagui({
  tokens,
  themes: {
    light: {
      background: colors.white,
      backgroundHover: colors.backgroundHover,
      color: colors.color,
      colorHover: colors.colorHover,
      borderColor: colors.borderColor,
      placeholderColor: colors.placeholderColor,

      // Brand colors
      red: colors.red,
      orange: colors.orange,
      yellow: colors.yellow,
      green: colors.green,
      blue: colors.blue,
      purple: colors.purple,
      pink: colors.pink,
      violet: colors.violet,
    },
    dark: {
      background: "#111827",
      backgroundHover: "#1f2937",
      color: "#f9fafb",
      colorHover: "#e5e7eb",
      borderColor: "#374151",
      placeholderColor: "#6b7280",

      // Brand colors (same)
      red: colors.red,
      orange: colors.orange,
      yellow: colors.yellow,
      green: colors.green,
      blue: colors.blue,
      purple: colors.purple,
      pink: colors.pink,
      violet: colors.violet,
    },
  },
  settings: {
    allowedStyleValues: "somewhat-strict-web",
    autocompleteSpecificTokens: "except-special",
    // Disable CSS variable injection
    disableSSR: true,
    // Don't add theme classes
    shouldAddPrefersColorThemes: false,
  },
})

export type AppConfig = typeof appConfig

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default appConfig
