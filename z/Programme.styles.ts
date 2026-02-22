/**
 * Generated from Programme.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const ProgrammeStyleDefs = {
  main: {
    position: "relative",
    width: "100%",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: "#000",
    color: "#fff",
    fontFamily: "var(--font-geist-mono), monospace",
  },
  content: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    padding: "0 1rem",
    textAlign: "center",
  },
  headline: {
    fontSize: "2.5rem",
    fontWeight: 700,
    maxWidth: "20ch",
  },
  subheadline: {
    marginTop: "1.5rem",
    fontSize: "1.125rem",
    color: "#9ca3af",
  },
  ctaWrapper: {
    marginTop: "3rem",
  },
  cta: {
    position: "relative",
    padding: "0.75rem 1rem",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "#fff",
    fontFamily: "inherit",
    fontSize: "0.875rem",
    overflow: "hidden",
    borderRadius: "2rem",
  },
  ctaText: {
    position: "relative",
    zIndex: 10,
  },
  ctaHover: {
    transform: "scaleX(1)",
  },
  ctaSecondary: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "#fff",
    fontFamily: "inherit",
    fontSize: "0.875rem",
    overflow: "hidden",
    marginTop: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    borderRadius: "2rem",
    position: "relative",
    padding: "0.75rem 1rem",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  ctaBack: {
    backgroundColor: "transparent",
    border: "none",
    color: "#6b7280",
    fontFamily: "inherit",
    fontSize: "0.75rem",
    padding: "0.5rem 1rem",
  },
  footer: {
    position: "absolute",
    bottom: "2rem",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: "0.75rem",
    color: "#4b5563",
  },
} as const

import { createStyleHook } from "../styles/createStyleHook"
import { createUnifiedStyles } from "../styles/createUnifiedStyles"

export const ProgrammeStyles = createUnifiedStyles(ProgrammeStyleDefs)

// Type for the hook return value
type ProgrammeStylesHook = {
  [K in keyof typeof ProgrammeStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useProgrammeStyles =
  createStyleHook<ProgrammeStylesHook>(ProgrammeStyles)
