/**
 * Generated from EmptyStateTips.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const EmptyStateTipsStyleDefs = {
  emptyStateTips: {
    marginTop: 15,
  },
  ul: {
    padding: 0,
    margin: 0,
    fontSize: 13,
  },
  tip: {
    marginBottom: 10,
    position: "relative",
  },
  tipText: {
    opacity: 0.8,
  },
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const EmptyStateTipsStyles = createUnifiedStyles(EmptyStateTipsStyleDefs)

// Type for the hook return value
type EmptyStateTipsStylesHook = {
  [K in keyof typeof EmptyStateTipsStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useEmptyStateTipsStyles =
  createStyleHook<EmptyStateTipsStylesHook>(EmptyStateTipsStyles)
