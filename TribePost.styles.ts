/**
 * TribePost styles
 * Unified styles for tribe post component
 *
 * Works on both web and native! 🎉
 */

export const TribePostStyleDefs = {
  container: {
    backgroundColor: "var(--background)",
    borderRadius: 16,
    border: "1px solid var(--shade-2)",
    overflow: "hidden",
    marginBottom: "1rem",
  },
  header: {
    padding: "1rem",
    borderBottom: "1px solid var(--shade-2)",
  },
  content: {
    padding: "1rem",
  },
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const TribePostStyles = createUnifiedStyles(TribePostStyleDefs)

// Type for the hook return value
type TribePostStylesHook = {
  [K in keyof typeof TribePostStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useTribePostStyles =
  createStyleHook<TribePostStylesHook>(TribePostStyles)
