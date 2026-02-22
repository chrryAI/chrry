/**
 * Generated from TestComponent.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const TestComponentStyleDefs = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    maxWidth: 500,
    minHeight: 200,
    padding: 16,
    margin: "0 auto",
    backgroundColor: "var(--background)",
    color: "var(--foreground)",
    border: "1px solid var(--shade-2)",
    borderRadius: 20,
    position: "relative",
    overflow: "hidden",
  },
  button: {
    base: {
      padding: "8px 16px",
      backgroundColor: "var(--accent-6)",
      color: "#fff",
      border: "none",
      borderRadius: 20,
      fontSize: 14,
      fontWeight: 600,
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
    },
    hover: {
      backgroundColor: "var(--accent-5)",
      transform: "translateY(-1px)",
    },
    active: {
      transform: "translateY(1px)",
    },
    focus: {
      outline: "2px solid var(--accent-6)",
      outlineOffset: 2,
    },
    disabled: {
      opacity: 0.5,
      cursor: "not-allowed",
      backgroundColor: "var(--shade-2)",
    },
  },
  link: {
    base: {
      color: "var(--link-color)",
      textDecorationLine: "none",
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
    },
    hover: {
      color: "var(--accent-5)",
      textDecorationLine: "underline",
    },
    active: {
      transform: "translateY(1px)",
    },
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 20,
    backgroundColor: "var(--background)",
    border: "1px solid var(--shade-2)",
    borderRadius: 16,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: "4vw",
    fontWeight: "bold",
    color: "var(--foreground)",
    textAlign: "center",
    margin: 0,
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 16,
    color: "var(--shade-5)",
    textAlign: "center",
    margin: "8px 0",
  },
  input: {
    base: {
      padding: "10px 14px",
      border: "1px solid var(--shade-2)",
      borderRadius: 8,
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
      fontSize: 14,
      width: "100%",
    },
    hover: {
      borderColor: "var(--shade-3)",
    },
    focus: {
      borderColor: "var(--accent-6)",
      outline: "none",
    },
    disabled: {
      opacity: 0.5,
      cursor: "not-allowed",
      backgroundColor: "var(--shade-1)",
    },
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "var(--accent-0)",
    color: "#fff",
    borderRadius: "50%",
    width: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: "bold",
  },
  parent: {
    padding: 16,
  },
  child: {
    margin: 8,
  },
  themeTest: {
    color: "var(--foreground)",
    backgroundColor: "var(--background)",
    borderColor: "var(--shade-2)",
    boxShadow: "var(--shadow)",
  },
  main: {
    padding: 10,
    paddingTop: 50,
    display: "flex",
    flexDirection: "column",
  },
  mainEmpty: {
    paddingTop: 0,
  },
  mainFullscreen: {
    padding: 0,
    height: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    position: "fixed",
    top: 0,
    padding: 10,
  },
  headerEmpty: {
    position: "static",
    margin: 0,
  },
  headerTransparent: {
    backgroundColor: "transparent",
  },
} as const

import { createUnifiedStyles } from "../styles/createUnifiedStyles"
import { createStyleHook } from "../styles/createStyleHook"

export const TestComponentStyles = createUnifiedStyles(TestComponentStyleDefs)

// Type for the hook return value
type TestComponentStylesHook = {
  [K in keyof typeof TestComponentStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useTestComponentStyles =
  createStyleHook<TestComponentStylesHook>(TestComponentStyles)
