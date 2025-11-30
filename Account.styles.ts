/**
 * Generated from Account.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const AccountStyleDefs = {
  userNameContainer: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    margin: "10px 0 5px 0",
  },
  userNameContainerInput: {
    flex: 1,
  },
  email: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  deleteAccountButton: {
    marginLeft: "auto",
  },
  userImageContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  userImageWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    position: "relative",
  },
  userImage: {
    borderRadius: "50%",
  },
  editImageButton: {
    padding: "3px !important",
    position: "absolute",
    bottom: -4,
    right: -5,
  },
  deleteAccount: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  accountContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  header: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    gap: 15,
    margin: 0,
    flex: 1,
  },
  title: {
    fontSize: 22,
    flex: 1,
    lineHeight: 1.2,
  },
  close: {
    marginLeft: "auto",
  },
  accounts: {
    marginTop: 5,
    display: "flex",
    alignItems: "flex-start",
    flexDirection: "column",
  },
  linkAccount: {
    marginLeft: "auto",
  },
  accountLinked: {
    justifyContent: "flex-start",
  },
  cookieConsent: {
    maxWidth: 400,
    padding: 0,
    border: "none",
    marginBottom: 10,
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginLeft: "auto",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 15,
    marginTop: 5,
    fontSize: 14,
  },
} as const

import { createUnifiedStyles } from "./styles/createUnifiedStyles"
import { createStyleHook } from "./styles/createStyleHook"

export const AccountStyles = createUnifiedStyles(AccountStyleDefs)

// Type for the hook return value
type AccountStylesHook = {
  [K in keyof typeof AccountStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useAccountStyles =
  createStyleHook<AccountStylesHook>(AccountStyles)
