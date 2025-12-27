/**
 * Generated from Skeleton.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const SkeletonStyleDefs = {
  page: {
    display: "flex",
    flexDirection: "row",
    paddingLeft: 0,
    alignItems: "flex-start",
    position: "relative",
  },
  subscribe: {
    left: 0,
  },
  brand: {
    fontWeight: "bold",
    margin: 0,
    fontSize: 18,
    position: "relative",
    lineHeight: 1,
    color: "var(--shade-7)",
  },
  blog: {
    display: "none",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 13,
  },
  middle: {
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  middleIsDrawerOpen: {
    position: "relative",
  },
  middleDesktop: {},
  middleMobile: {
    position: "relative",
    marginBottom: 10,
  },
  subscribeMobileWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  title: {
    fontSize: 22,
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    position: "relative",
    bottom: 50,
    height: "100dvh",
  },
  main: {
    padding: 10,
    paddingTop: 50,
    display: "flex",
    flexDirection: "column",
    flex: 1,
    height: "100dvh",
  },
  mainEmpty: {
    paddingTop: 0,
  },
  contentContainer: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  signIn: {
    display: "none",
  },
  hamburgerMenu: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  brandHelp: {
    textAlign: "center",
    fontSize: 18,
    lineHeight: 1.2,
  },
  footer: {
    width: "100%",
  },
  hamburgerButton: {
    position: "relative",
  },
  notification: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: "50%",
    backgroundColor: "var(--accent-1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    color: "var(--background)",
    boxShadow: "var(--shadow)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "fixed",
    top: 0,
    right: 0,
    padding: "10px 10px",
    width: "calc(100%)",
    zIndex: 1000,
    backgroundColor: "var(--background-transparent)",
  },
  headerStandalone: {
    backgroundColor: "var(--background)",
  },
  headerEmpty: {
    position: "static",
    margin: 0,
    padding: "10px 0",
  },
} as const

import { createUnifiedStyles } from "./styles/createUnifiedStyles"
import { createStyleHook } from "./styles/createStyleHook"

export const SkeletonStyles = createUnifiedStyles(SkeletonStyleDefs)

// Type for the hook return value
type SkeletonStylesHook = {
  [K in keyof typeof SkeletonStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useSkeletonStyles =
  createStyleHook<SkeletonStylesHook>(SkeletonStyles)
