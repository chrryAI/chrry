/**
 * Generated from Share.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const ShareStyleDefs = {
  shareModalInputContainer: {
    display: "flex",
    gap: 10,
  },
  collaborateInputContainer: {
    display: "flex",
    gap: 10,
  },
  shareModalInput: {
    flex: 1,
  },
  collaborateInput: {
    flex: 1,
  },
  collaborateFooter: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },
  share: {
    fontSize: 12,
    position: "relative",
    bottom: 1,
  },
  shareModalContent: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  collaboratorEmail: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  shareModalDescription: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },
  collaboratorStatus: {
    display: "inline-flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    position: "relative",
    top: 1,
  },
  collaborators: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    fontSize: 14,
  },
  collaborator: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  collaboratorImage: {
    borderRadius: "50%",
  },
  collaboratorName: {
    marginTop: 0,
  },
  collaboratorActions: {
    marginLeft: "auto",
  },
} as const

import { createUnifiedStyles } from "./styles/createUnifiedStyles"
import { createStyleHook } from "./styles/createStyleHook"

export const ShareStyles = createUnifiedStyles(ShareStyleDefs)

// Type for the hook return value
type ShareStylesHook = {
  [K in keyof typeof ShareStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useShareStyles = createStyleHook<ShareStylesHook>(ShareStyles)
