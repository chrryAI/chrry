/**
 * Generated from CollaborationStatus.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const CollaborationStatusStyleDefs = {
  collaborationStatus: {
    display: "inline-flex",
    gap: 10,
  },
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const CollaborationStatusStyles = createUnifiedStyles(
  CollaborationStatusStyleDefs,
)

// Type for the hook return value
type CollaborationStatusStylesHook = {
  [K in keyof typeof CollaborationStatusStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useCollaborationStatusStyles =
  createStyleHook<CollaborationStatusStylesHook>(CollaborationStatusStyles)
