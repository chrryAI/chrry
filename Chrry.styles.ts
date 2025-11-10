/**
 * Generated from Chrry.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const ChrryStyleDefs = {
  container: {
    maxWidth: 600,
    margin: "0 auto",
    flexDirection: "column",
    display: "flex",
    padding: "40px 10px 20px 10px",
  },
  logo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    display: "flex",
    flexDirection: "column",
  },
  description: {
    display: "flex",
    marginTop: 0,
  },
  links: {
    marginTop: 10,
    display: "flex",
    gap: 25,
    marginBottom: 20,
  },
  link: {
    display: "inline-flex",
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  feature: {
    display: "flex",
    gap: 10,
  },
  vex: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
    width: "100%",
  },
  featureTitle: {
    margin: 0,
    marginBottom: 5,
    display: "flex",
    gap: 3,
  },
} as const

import { createUnifiedStyles } from "chrry/styles/createUnifiedStyles"
import { createStyleHook } from "chrry/styles/createStyleHook"

export const ChrryStyles = createUnifiedStyles(ChrryStyleDefs)

// Type for the hook return value
type ChrryStylesHook = {
  [K in keyof typeof ChrryStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useChrryStyles = createStyleHook<ChrryStylesHook>(ChrryStyles)
