/**
 * Generated from Thread.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const ThreadStyleDefs = {
  thread: {
    maxWidth: 600,
    marginTop: 5,
    marginRight: "auto",
    marginBottom: 0,
    marginLeft: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    fontSize: 15,
    padding: "0 10px 195px 10px",
    width: "100%",
  },
  threadEmpty: {
    marginTop: "auto",
    padding: "0 10px 160px 10px",
  },
  hourlyLimit: {
    fontSize: 12,
    color: "var(--shade-6)",
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  likeButton: {
    base: {
      fontSize: 12,
      color: "var(--shade-6)",
    },
    hover: {
      color: "var(--accent-1)",
    },
  },
  headers: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 5,
  },
  header: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  chatTop: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    justifyContent: "center",
    marginTop: 30,
    width: "100%",
    height: "100%",
    flex: 1,
    alignItems: "center",
    display: "flex",
    gap: 5,
  },
  errorContainer: {
    justifyContent: "center",
    marginTop: 30,
    width: "100%",
    height: "100%",
    flex: 1,
    alignItems: "center",
    display: "flex",
    gap: 5,
  },
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const ThreadStyles = createUnifiedStyles(ThreadStyleDefs)

// Type for the hook return value
type ThreadStylesHook = {
  [K in keyof typeof ThreadStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useThreadStyles = createStyleHook<ThreadStylesHook>(ThreadStyles)
