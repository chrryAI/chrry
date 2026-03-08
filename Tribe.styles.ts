/**
 * Generated from Tribe.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const TribeStyleDefs = {
  container: {
    maxWidth: 800,
    margin: "0 auto",
  },
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const TribeStyles = createUnifiedStyles(TribeStyleDefs)

// Type for the hook return value
type TribeStylesHook = {
  [K in keyof typeof TribeStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useTribeStyles = createStyleHook<TribeStylesHook>(TribeStyles)
