/**
 * Generated from Menu.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const MenuStyleDefs = {
  menu: {
    backgroundColor: "var(--shade-1-transparent)",
    padding: "10px 13px 10px 10px",
    flexDirection: "column",
    zIndex: 1000,
    position: "fixed",
    top: 0,
    left: 0,
    height: "100dvh",
    display: "none",
    width: 250,
  },
  menuOpen: {
    position: "fixed",
    display: "flex",
    zIndex: 9999,
  },
  menuClosed: {
    display: "none",
  },
  threadList: {
    opacity: 0,
  },
  profileButton: {
    fontSize: 18,
    fontWeight: 600,
  },
  hamburgerMenu: {
    display: "flex",
    alignItems: "center",
    top: 10,
    gap: 15,
    left: 10,
  },
  hamburgerButton: {
    color: "var(--accent-1)",
  },
  menuContent: {
    display: "flex",
    marginTop: 10,
  },
  threads: {
    marginTop: 8,
    marginRight: -7,
  },
  threadsLoading: {
    display: "flex",
    flexDirection: "column",
  },
  threadsThreadItem: {},
  noThreadsContainer: {
    fontSize: 12,
  },
  threadsTitle: {
    fontSize: 18,
    margin: 0,
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  loadMoreButton: {
    fontSize: 13,
    padding: "5px 10px",
    display: "flex",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
    marginBottom: 8,
  },
  loadMoreButtonContainer: {
    display: "flex",
    justifyContent: "center",
  },
  menuHeader: {
    display: "flex",
    alignItems: "flex-start",
  },
  mobileMenuHeader: {
    display: "flex",
  },
  mobileMenuHeaderOpen: {
    display: "none",
  },
  colorSchemeContainer: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  reduceMotionButton: {
    marginLeft: "auto",
    fontSize: 12,
  },
  desktopMenuHeader: {
    display: "none",
  },
  desktopMenuHeaderOpen: {
    display: "flex",
  },
  threadsList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 10,
    fontSize: 13,
  },
  brand: {
    fontSize: 18,
    fontWeight: "bold",
    color: "var(--shade-7)",
  },
  threadItem: {
    paddingRight: 17,
    display: "flex",
    alignItems: "center",
    gap: 3,
    position: "relative",
    lineHeight: 1.3,
    color: "var(--shade-6)",
  },
  star: {
    display: "inline-flex",
  },
  starStarActive: {
    display: "inline-flex",
  },
  collaborationStatus: {
    marginLeft: "auto",
  },
  footer: {
    display: "flex",
    marginTop: "auto",
    flexDirection: "column",
    gap: 13,
    position: "relative",
    bottom: 5,
  },
  bottom: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  colorScheme: {
    marginLeft: 5,
  },
  standaloneIos: {
    paddingBottom: 15,
  },
  footerStandalone: {
    marginTop: "auto",
  },
  menuItems: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    flex: 1,
  },
  menuItemButton: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    flexDirection: "row",
  },
  menuButton: {
    display: "flex",
    marginLeft: "auto",
  },
} as const

import { createUnifiedStyles } from "chrry/styles/createUnifiedStyles"
import { createStyleHook } from "chrry/styles/createStyleHook"

export const MenuStyles = createUnifiedStyles(MenuStyleDefs)

// Type for the hook return value
type MenuStylesHook = {
  [K in keyof typeof MenuStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useMenuStyles = createStyleHook<MenuStylesHook>(MenuStyles)
