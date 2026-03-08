/**
 * Generated from Select.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const SelectStyleDefs = {
  customSelect: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
  },
  select: {
    base: {
      padding: "0.5rem 2.5rem 0.5rem 0.5rem",
      border: "1px solid var(--shade-2)",
      borderRadius: "var(--radius)",
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
    },
    active: {
      borderColor: "var(--link-color)",
      outline: "var(--link-color)",
    },
  },
  icon: {
    position: "absolute",
    right: 8,
  },
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const SelectStyles = createUnifiedStyles(SelectStyleDefs)

// Type for the hook return value
type SelectStylesHook = {
  [K in keyof typeof SelectStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useSelectStyles = createStyleHook<SelectStylesHook>(SelectStyles)
