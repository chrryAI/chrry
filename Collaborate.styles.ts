/**
 * Generated from Collaborate.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const CollaborateStyleDefs = {
  collaborateTextarea: {
    minHeight: 200,
    borderStyle: "dashed",
    fontSize: 15,
  },
  modal: {
    width: "100%",
    margin: "0 auto !important",
    maxWidth: 600,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 10,
    marginLeft: "auto",
  },
} as const

import { createUnifiedStyles } from "chrry/styles/createUnifiedStyles"
import { createStyleHook } from "chrry/styles/createStyleHook"

export const CollaborateStyles = createUnifiedStyles(CollaborateStyleDefs)

// Type for the hook return value
type CollaborateStylesHook = {
  [K in keyof typeof CollaborateStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useCollaborateStyles =
  createStyleHook<CollaborateStylesHook>(CollaborateStyles)
