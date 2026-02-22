/**
 * Generated from ColorScheme.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const ColorSchemeStyleDefs = {
  colorScheme: {
    display: "flex",
    gap: 5,
  },
  color: {
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "var(--shadow)",
    zIndex: 10000,
    position: "relative",
  },
  check: {
    position: "absolute",
  },
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const ColorSchemeStyles = createUnifiedStyles(ColorSchemeStyleDefs)

// Type for the hook return value
type ColorSchemeStylesHook = {
  [K in keyof typeof ColorSchemeStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useColorSchemeStyles =
  createStyleHook<ColorSchemeStylesHook>(ColorSchemeStyles)
