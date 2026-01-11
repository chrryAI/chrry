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
  formSwitchTrack: {
    position: "relative",
    display: "inline-block",
    width: 46,
    height: 26,
    backgroundColor: "var(--shade-2)",
    borderRadius: 23,
  },
  formSwitchTrackChecked: {
    backgroundColor: "var(--link-color)",
  },
  formSwitchThumb: {
    position: "absolute",
    left: 2,
    top: 2,
    width: 22,
    height: 22,
    backgroundColor: "#fff",
    borderRadius: 11,
    boxShadow: "var(--shadow)",
  },
  formSwitchThumbChecked: {
    transform: "translateX(20px)",
  },
  formSwitchLabel: {
    flex: 1,
  },
} as const

import { createUnifiedStyles } from "./styles/createUnifiedStyles"
import { createStyleHook } from "./styles/createStyleHook"

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
