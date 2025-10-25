/**
 * Generated from Sidebar.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const SidebarStyleDefs = {
  sidebar: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    padding: 10,
  },
  splash: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "fixed",
    backgroundColor: "var(--background)",
    zIndex: 999999,
  },
  splashHidden: {
    display: "none",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 5,
  },
  content: {
    flex: 1,
  },
  footer: {
    display: "flex",
    gap: 5,
  },
  brandContainer: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  brand: {
    fontWeight: "bold",
    fontSize: 15,
  },
  menuButton: {
    display: "flex",
  },
  userButton: {
    display: "flex",
  },
  contentHelp: {
    fontSize: 26,
    fontWeight: "bold",
    margin: 0,
    marginTop: 40,
    lineHeight: 1.2,
    textAlign: "center",
    alignSelf: "center",
  },
} as const

import { createUnifiedStyles } from "chrry/styles/createUnifiedStyles"
import { createStyleHook } from "chrry/styles/createStyleHook"

export const SidebarStyles = createUnifiedStyles(SidebarStyleDefs)

// Type for the hook return value
type SidebarStylesHook = {
  [K in keyof typeof SidebarStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useSidebarStyles =
  createStyleHook<SidebarStylesHook>(SidebarStyles)
