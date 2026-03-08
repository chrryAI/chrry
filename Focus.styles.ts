/**
 * Generated from Focus.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const FocusStyleDefs = {
  page: {
    display: "flex",
    flexDirection: "column",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  focusButton: {
    paddingTop: 0,
  },
  focusButtonHidden: {
    flexDirection: "column",
    gap: 20,
    flex: 1,
    display: "none",
  },
  focusButtonFocusButton: {},
  moodReports: {
    paddingTop: 0,
  },
  moodReportsFocusButton: {},
  top: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    gap: 25,
    flex: 1,
    padding: 10,
    paddingBottom: 0,
    zIndex: 10,
    top: 0,
    fontSize: 14,
  },
  left: {
    marginRight: "auto",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  right: {
    marginLeft: "auto",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const FocusStyles = createUnifiedStyles(FocusStyleDefs)

// Type for the hook return value
type FocusStylesHook = {
  [K in keyof typeof FocusStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useFocusStyles = createStyleHook<FocusStylesHook>(FocusStyles)
