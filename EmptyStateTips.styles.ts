/**
 * Generated from EmptyStateTips.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const EmptyStateTipsStyleDefs = {
  tip: {
    marginBottom: 10,
    position: "relative",
  },
  tipText: {
    opacity: 0.8,
  },
} as const

import { createUnifiedStyles } from "chrry/styles/createUnifiedStyles"
import { createStyleHook } from "chrry/styles/createStyleHook"

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
