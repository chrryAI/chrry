/**
 * Generated from MemoryConsent.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const MemoryConsentStyleDefs = {
  memoryConsent: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
    maxWidth: 420,
    borderRadius: "var(--radius)",
    fontSize: 15,
    margin: "10px auto 15px auto",
    position: "relative",
  },
  memoryConsentManage: {
    border: "1px solid var(--shade-2)",
    padding: "10px 15px",
    backgroundColor: "var(--shade-1)",
  },
  options: {
    display: "flex",
    gap: 10,
    flexDirection: "column",
    fontSize: 14,
  },
  buttons: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    borderStyle: "dashed",
  },
} as const

import { createUnifiedStyles } from "chrry/styles/createUnifiedStyles"
import { createStyleHook } from "chrry/styles/createStyleHook"

export const MemoryConsentStyles = createUnifiedStyles(MemoryConsentStyleDefs)

// Type for the hook return value
type MemoryConsentStylesHook = {
  [K in keyof typeof MemoryConsentStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useMemoryConsentStyles =
  createStyleHook<MemoryConsentStylesHook>(MemoryConsentStyles)
