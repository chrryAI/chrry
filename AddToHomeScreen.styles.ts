/**
 * Generated from AddToHomeScreen.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const AddToHomeScreenStyleDefs = {
  addToHomeScreen: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    top: 0,
    left: 0,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1001,
    position: "fixed",
    backgroundColor: "var(--overlay)",
  },
  main: {
    margin: "0 auto",
    width: "100%",
    padding: "0 10px",
    zIndex: 3,
    position: "relative",
    flex: 1,
    flexDirection: "column",
    display: "flex",
    justifyContent: "center",
  },
  inner: {
    backgroundColor: "var(--background)",
    padding: 20,
    borderRadius: 20,
    border: "1px solid var(--shade-2)",
    position: "relative",
    minWidth: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    boxShadow: "var(--shadow)",
  },
  close: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  logoContainer: {
    display: "inline-flex",
    borderRadius: 10,
    padding: 10,
    border: "1px solid var(--shade-2)",
    backgroundColor: "var(--background)",
    height: "fit-content",
    width: "fit-content",
  },
  content: {
    margin: "0 0 10px 0",
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  icon: {
    width: 24,
    height: 24,
  },
  share: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    border: "1px solid var(--shade-2)",
    backgroundColor: "var(--background)",
    marginTop: 10,
    borderRadius: 10,
    width: "fit-content",
    padding: "5px 8px",
  },
  addHomeScreenAndroid: {
    marginTop: 0,
  },
  selectAddToHomeScreen: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  quickAccess: {
    fontSize: 14,
  },
  scrollDown: {
    fontWeight: "bold",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    margin: "0 0 10px 0",
  },
} as const

import { createUnifiedStyles } from "chrry/styles/createUnifiedStyles"
import { createStyleHook } from "chrry/styles/createStyleHook"

export const AddToHomeScreenStyles = createUnifiedStyles(
  AddToHomeScreenStyleDefs,
)

// Type for the hook return value
type AddToHomeScreenStylesHook = {
  [K in keyof typeof AddToHomeScreenStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useAddToHomeScreenStyles =
  createStyleHook<AddToHomeScreenStylesHook>(AddToHomeScreenStyles)
