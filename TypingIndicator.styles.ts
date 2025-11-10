/**
 * Generated from TypingIndicator.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const TypingIndicatorStyleDefs = {
  typingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    margin: "8px 0",
    backgroundColor: "var(--shade-1)",
    borderRadius: 12,
    fontSize: 13,
    color: "var(--shade-5)",
    border: "1px solid var(--shade-2)",
  },
  avatars: {
    display: "flex",
    gap: 4,
  },
  avatar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 20,
    height: 20,
    borderRadius: "50%",
    backgroundColor: "var(--shade-2)",
    overflow: "hidden",
  },
  userImage: {
    borderRadius: "50%",
    width: "100%",
    height: "100%",
  },
  typingText: {
    flex: 1,
    fontWeight: 500,
  },
  dots: {
    display: "flex",
    gap: 2,
    alignItems: "center",
  },
} as const

import { createUnifiedStyles } from "chrry/styles/createUnifiedStyles"
import { createStyleHook } from "chrry/styles/createStyleHook"

export const TypingIndicatorStyles = createUnifiedStyles(
  TypingIndicatorStyleDefs,
)

// Type for the hook return value
type TypingIndicatorStylesHook = {
  [K in keyof typeof TypingIndicatorStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useTypingIndicatorStyles =
  createStyleHook<TypingIndicatorStylesHook>(TypingIndicatorStyles)
