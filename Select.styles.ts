/**
 * Generated from Select.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const SelectStyleDefs = {
  icon: {
    position: "absolute",
    right: 10,
    top: "50%",
  },
} as const

import { createUnifiedStyles } from "chrry/styles/createUnifiedStyles"
import { createStyleHook } from "chrry/styles/createStyleHook"

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
