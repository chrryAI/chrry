/**
 * Generated from Checkbox.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const CheckboxStyleDefs = {
  formSwitch: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
  },
} as const

import { createUnifiedStyles } from "chrry/styles/createUnifiedStyles"
import { createStyleHook } from "chrry/styles/createStyleHook"

export const CheckboxStyles = createUnifiedStyles(CheckboxStyleDefs)

// Type for the hook return value
type CheckboxStylesHook = {
  [K in keyof typeof CheckboxStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useCheckboxStyles =
  createStyleHook<CheckboxStylesHook>(CheckboxStyles)
