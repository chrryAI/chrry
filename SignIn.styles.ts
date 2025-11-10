/**
 * Generated from SignIn.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const SignInStyleDefs = {
  container: {
    display: "flex",
    gap: 10,
    fontSize: 14,
  },
  signInButton: {
    display: "none",
  },
  video: {
    width: 30,
    height: 30,
    borderRadius: "50%",
  },
  registerButton: {
    display: "flex",
  },
  signInButtons: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    zIndex: 1000,
  },
  switchMode: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  googleButton: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    borderRadius: 13,
  },
  modal: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    top: 0,
    left: 0,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999,
    position: "fixed",
    backgroundColor: "var(--overlay)",
  },
  main: {
    margin: "0 auto",
    width: "auto",
    padding: "0 10px",
    zIndex: 3,
    position: "relative",
    flex: 1,
    flexDirection: "column",
    display: "flex",
    justifyContent: "center",
  },
  inner: {
    position: "relative",
    minWidth: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  close: {
    display: "flex",
    position: "absolute",
    top: -40,
    border: "none",
  },
} as const

import { createUnifiedStyles } from "chrry/styles/createUnifiedStyles"
import { createStyleHook } from "chrry/styles/createStyleHook"

export const SignInStyles = createUnifiedStyles(SignInStyleDefs)

// Type for the hook return value
type SignInStylesHook = {
  [K in keyof typeof SignInStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useSignInStyles = createStyleHook<SignInStylesHook>(SignInStyles)
