/**
 * Generated from Star.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const StarStyleDefs = {
  star: {
    base: {
      display: "inline-flex",
      fontSize: 12,
      color: "var(--shade-6)",
    },
    hover: {
      color: "var(--accent-1)",
    },
  },
  starActive: {
    display: "inline-flex",
  },
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const StarStyles = createUnifiedStyles(StarStyleDefs)

// Type for the hook return value
type StarStylesHook = {
  [K in keyof typeof StarStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useStarStyles = createStyleHook<StarStylesHook>(StarStyles)
