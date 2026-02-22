/**
 * Generated from EnableNotifications.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const EnableNotificationsStyleDefs = {
  enableNotificationsButton: {
    display: "inline-flex",
    alignItems: "center",
  },
  enableNotifications: {
    display: "inline-flex",
  },
  enableNotificationsContainer: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
  },
  withoutNotifications: {
    paddingTop: 0,
  },
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const EnableNotificationsStyles = createUnifiedStyles(
  EnableNotificationsStyleDefs,
)

// Type for the hook return value
type EnableNotificationsStylesHook = {
  [K in keyof typeof EnableNotificationsStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useEnableNotificationsStyles =
  createStyleHook<EnableNotificationsStylesHook>(EnableNotificationsStyles)
