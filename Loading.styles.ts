/**
 * Generated from Loading.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const LoadingStyleDefs = {
  loadingCircle: {
    color: "var(--accent-6)",
  },
  loadingWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100dvh",
  },
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const LoadingStyles = createUnifiedStyles(LoadingStyleDefs)

// Type for the hook return value
type LoadingStylesHook = {
  [K in keyof typeof LoadingStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useLoadingStyles =
  createStyleHook<LoadingStylesHook>(LoadingStyles)
