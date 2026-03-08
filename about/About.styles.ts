/**
 * Generated from About.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const AboutStyleDefs = {
  ossLink: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  oss: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  ossWrapper: {
    marginBottom: 20,
    display: "flex",
    flexDirection: "column",
  },
  ossContainer: {
    display: "flex",
    gap: 15,
    flexDirection: "column",
  },
  ossContainerDesktop: {
    flexDirection: "row",
    alignItems: "center",
  },
  apps: {
    display: "flex",
    flexWrap: "wrap",
    gap: 15,
    margin: "15px 0",
  },
  app: {
    base: {
      flex: 1,
      minWidth: 200,
      padding: 15,
      border: "1px dashed var(--shade-2)",
      borderRadius: 20,
      display: "flex",
      flexDirection: "column",
      gap: 5,
      margin: 0,
      fontSize: 15,
      marginBottom: 8,
    },
    hover: {
      border: "1px solid var(--accent-1)",
      backgroundColor: "var(--shade-1)",
    },
  },
  h2: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  signInButton: {
    marginLeft: "auto",
    fontSize: 13,
  },
  appDescription: {
    fontSize: 13,
    color: "var(--shade-6)",
  },
  video: {
    width: "100%",
    maxWidth: "100%",
    marginTop: 10,
    borderRadius: 10,
  },
  copyright: {
    marginBottom: 20,
  },
  lastUpdated: {
    fontSize: 13,
    color: "var(--shade-6)",
    display: "flex",
    alignItems: "center",
    gap: 5,
    marginTop: 20,
  },
} as const

import { createStyleHook } from "../styles/createStyleHook"
import { createUnifiedStyles } from "../styles/createUnifiedStyles"

export const AboutStyles = createUnifiedStyles(AboutStyleDefs)

// Type for the hook return value
type AboutStylesHook = {
  [K in keyof typeof AboutStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useAboutStyles = createStyleHook<AboutStylesHook>(AboutStyles)
