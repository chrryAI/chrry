/**
 * Generated from Subscribe.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const SubscribeStyleDefs = {
  subscribeButton: {
    base: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      backgroundColor: "var(--background)",
      border: "1px solid var(--accent-1) !important",
      boxShadow: "none",
      padding: "5px 10px",
      color: "var(--foreground)",
    },
    disabled: {
      backgroundColor: "var(--background)",
      color: "var(--shade-6)",
    },
  },
  subscribeButtonIsDrawerOpen: {
    position: "relative",
    left: 125,
  },
  checkout: {
    display: "inline-flex",
  },
  svg: {},
  plusButton: {
    base: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      backgroundColor: "var(--background)",
      border: "1px solid var(--accent-1) !important",
      boxShadow: "none",
      padding: "5px 10px",
      color: "var(--foreground)",
    },
    disabled: {
      backgroundColor: "var(--background)",
      color: "var(--shade-6)",
    },
  },
  button: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px !important",
    fontSize: 16,
  },
  plans: {
    marginBottom: 8,
    display: "flex",
    gap: 5,
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
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
    zIndex: 10,
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
    backgroundColor: "var(--background)",
    padding: 20,
    paddingTop: 10,
    borderRadius: "var(--radius)",
    border: "1px solid var(--shade-2)",
    position: "relative",
    minWidth: "100%",
    display: "flex",
    flexDirection: "column",
    boxShadow: "var(--shadow)",
    gap: 5,
    justifyContent: "flex-start",
  },
  title: {
    margin: 0,
    marginBottom: 5,
    borderBottom: "1px solid var(--shade-2)",
    padding: 0,
    paddingBottom: 5,
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  close: {
    marginLeft: "auto",
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    margin: 0,
    fontSize: 15,
    padding: 0,
  },
  feature: {
    margin: 0,
    display: "flex",
    gap: 1,
    alignItems: "center",
    padding: 0,
  },
  checkoutButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    fontSize: 16,
    backgroundColor: "var(--accent-4)",
  },
  userToGift: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  gift: {
    marginTop: 10,
  },
  invite: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  userToGiftName: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  backButton: {
    marginLeft: "auto",
  },
  inviteInput: {
    flex: 1,
  },
  subscribeAsGuest: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 15,
    marginBottom: 3,
    color: "var(--shade-7)",
  },
  giftButton: {
    display: "flex",
    gap: 5,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    fontSize: 16,
    width: "100%",
    padding: 10,
  },
  currentPlanButton: {
    display: "flex",
    gap: 5,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    fontSize: 16,
    width: "100%",
    padding: 10,
  },
  cancelSubscriptionButton: {
    display: "flex",
    gap: 5,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    fontSize: 16,
    width: "100%",
    padding: 10,
  },
  checkoutButtonContainer: {
    display: "flex",
    gap: 9,
    flexDirection: "column",
    marginTop: 9,
  },
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const SubscribeStyles = createUnifiedStyles(SubscribeStyleDefs)

// Type for the hook return value
type SubscribeStylesHook = {
  [K in keyof typeof SubscribeStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useSubscribeStyles =
  createStyleHook<SubscribeStylesHook>(SubscribeStyles)
