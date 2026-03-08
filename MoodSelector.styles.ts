/**
 * Generated from MoodSelector.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const MoodSelectorStyleDefs = {
  emojiContainer: {
    display: "flex",
    gap: 7,
  },
  emoji: {
    fontSize: 24,
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  mobile: {
    display: "inline",
  },
  desktop: {
    display: "none",
  },
  edit: {},
  children: {
    fontSize: 16,
    color: "var(--foreground)",
  },
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const MoodSelectorStyles = createUnifiedStyles(MoodSelectorStyleDefs)

// Type for the hook return value
type MoodSelectorStylesHook = {
  [K in keyof typeof MoodSelectorStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useMoodSelectorStyles =
  createStyleHook<MoodSelectorStylesHook>(MoodSelectorStyles)
