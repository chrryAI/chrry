/**
 * Generated from Modal.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const ModalStyleDefs = {
  modal: {
    height: "100dvh",
    width: "100vw",
    display: "flex",
    top: 0,
    left: 0,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    position: "fixed",
    backgroundColor: "var(--overlay)",
    fontSize: 16,
  },
  video: {
    width: 35,
    height: 35,
    borderRadius: "50%",
    backgroundColor: "black",
    objectFit: "cover",
  },
  main: {
    margin: "0 auto",
    padding: "0 10px",
    zIndex: 3,
    position: "relative",
    flex: 1,
    flexDirection: "column",
    display: "flex",
    justifyContent: "center",
    width: "100%",
  },
  inner: {
    backgroundColor: "var(--background)",
    padding: 13,
    borderRadius: "var(--radius)",
    border: "1px solid var(--shade-2-transparent)",
    position: "relative",
    maxHeight: "calc(100dvh - 20px)",
    maxWidth: 960,
    display: "flex",
    flexDirection: "column",
    gap: 5,
    justifyContent: "flex-start",
    width: "100%",
  },
  header: {
    margin: 0,
    marginBottom: 5,
    padding: 0,
    paddingBottom: 8,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  title: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  borderHeader: {
    borderBottom: "1px dashed var(--shade-2)",
  },
  close: {
    display: "flex",
  },
  email: {
    marginBottom: 5,
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    marginLeft: "auto",
  },
  mainIsDrawerOpen: {
    left: 125,
  },
  content: {
    display: "flex",
    flexDirection: "column",
    maxHeight: "80dvh",
    overflowY: "auto",
  },
  contentScrollable: {
    overflowY: "auto",
  },
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const ModalStyles = createUnifiedStyles(ModalStyleDefs)

// Type for the hook return value
type ModalStylesHook = {
  [K in keyof typeof ModalStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useModalStyles = createStyleHook<ModalStylesHook>(ModalStyles)
