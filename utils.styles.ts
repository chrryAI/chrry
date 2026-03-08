/**
 * Generated from utils.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const UtilsStyleDefs = {
  button: {
    base: {
      padding: "8px 12px",
      backgroundColor: "var(--link-color)",
      color: "#fff",
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      border: "none",
      borderRadius: "var(--radius)",
      boxShadow: "var(--shadow)",
      fontSize: 14,
      lineHeight: 1.15,
    },
    hover: {
      backgroundColor: "var(--accent-5)",
      color: "#fff",
    },
    active: {
      transform: "translateY(1px)",
    },
    disabled: {
      cursor: "default",
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
    },
  },
  link: {
    base: {
      textDecorationLine: "none",
      color: "var(--accent-6)",
      backgroundColor: "transparent",
      boxShadow: "none",
      padding: 0,
      margin: 0,
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
    },
    hover: {
      textDecorationLine: "none",
      color: "var(--accent-5)",
      backgroundColor: "transparent",
    },
    active: {
      transform: "translateY(1px)",
    },
  },
  small: {
    padding: "6px 9px",
    fontSize: 14,
  },
  xSmall: {
    padding: "4px 7px",
    fontSize: 12,
  },
  large: {
    padding: "8px 20px",
    fontSize: 16,
  },
  transparent: {
    base: {
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
      border: "1px solid var(--shade-2)",
      boxShadow: "none",
    },
    hover: {
      backgroundColor: "var(--shade-1)",
      color: "var(--foreground)",
    },
  },
  inverted: {
    base: {
      backgroundColor: "var(--foreground)",
      color: "var(--background)",
      border: "1px solid var(--shade-2)",
      boxShadow: "none",
    },
    hover: {
      backgroundColor: "var(--shade-7)",
      color: "var(--background)",
    },
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
    flex: 1,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    flex: 1,
  },
  left: {
    marginRight: "auto",
  },
  right: {
    marginLeft: "auto",
  },
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const UtilsStyles = createUnifiedStyles(UtilsStyleDefs)

// Type for the hook return value
type UtilsStylesHook = {
  [K in keyof typeof UtilsStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useUtilsStyles = createStyleHook<UtilsStylesHook>(UtilsStyles)
