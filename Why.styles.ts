/**
 * Generated from Why.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const WhyStyleDefs = {
  desktopOnly: {
    display: "none",
  },
  why: {
    fontSize: 15,
  },
  mobileOnly: {
    display: "flex",
    flexDirection: "column",
  },
  features: {
    gap: 20,
  },
  feature: {
    padding: 20,
    backgroundColor: "var(--shade-1)",
    borderRadius: 8,
    border: "1px solid var(--shade-2)",
  },
  comparison: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 20,
  },
  comparisonItem: {
    padding: 16,
    backgroundColor: "var(--shade-1)",
    borderRadius: 6,
  },
} as const

import { createUnifiedStyles } from "chrry/styles/createUnifiedStyles"
import { createStyleHook } from "chrry/styles/createStyleHook"

export const WhyStyles = createUnifiedStyles(WhyStyleDefs)

// Type for the hook return value
type WhyStylesHook = {
  [K in keyof typeof WhyStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useWhyStyles = createStyleHook<WhyStylesHook>(WhyStyles)
