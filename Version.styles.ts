/**
 * Generated from Version.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const VersionStyleDefs = {
  video: {
    width: 30,
    height: 30,
    objectFit: "cover",
    borderRadius: "50%",
  },
  updateModalButtons: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  updateModalDescription: {
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
} as const

import { createUnifiedStyles } from "./styles/createUnifiedStyles"
import { createStyleHook } from "./styles/createStyleHook"

export const VersionStyles = createUnifiedStyles(VersionStyleDefs)

// Type for the hook return value
type VersionStylesHook = {
  [K in keyof typeof VersionStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useVersionStyles =
  createStyleHook<VersionStylesHook>(VersionStyles)
