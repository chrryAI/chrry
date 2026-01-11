/**
 * Generated from EditThread.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const EditThreadStyleDefs = {
  editThreadContainer: {},
  editThreadInput: {
    width: "100%",
    height: "100%",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 10,
  },
  modal: {
    width: "100%",
    margin: "0 auto !important",
    maxWidth: 600,
  },
  right: {
    marginLeft: "auto",
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  deleteThread: {
    marginLeft: "auto",
  },
  charLeft: {
    color: "var(--accent-4)",
    fontSize: 11,
    fontWeight: "normal",
  },
  charLeftOrange: {
    color: "var(--accent-1)",
  },
  charLeftRed: {
    color: "var(--accent-0)",
  },
  maxCharCount: {
    color: "var(--accent-4)",
    fontSize: 11,
    fontWeight: "normal",
  },
  maxCharCountOrange: {
    color: "var(--accent-1)",
  },
  maxCharCountRed: {
    color: "var(--accent-0)",
  },
} as const

import { createUnifiedStyles } from "./styles/createUnifiedStyles"
import { createStyleHook } from "./styles/createStyleHook"

export const EditThreadStyles = createUnifiedStyles(EditThreadStyleDefs)

// Type for the hook return value
type EditThreadStylesHook = {
  [K in keyof typeof EditThreadStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useEditThreadStyles =
  createStyleHook<EditThreadStylesHook>(EditThreadStyles)
