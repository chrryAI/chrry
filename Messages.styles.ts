/**
 * Generated from Messages.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const MessagesStyleDefs = {
  messagesContainer: {
    display: "flex",
    flexDirection: "column",
    marginTop: 20,
    justifyContent: "flex-end",
    overflowY: "auto",
    maxHeight: "100%",
  },
  messages: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  loadMoreContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 10,
  },
  emptyContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 10,
  },
  characterProfileContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
    gap: 10,
    flexDirection: "column",
  },
  loading: {
    display: "flex",
    gap: 5,
    marginTop: 30,
    flexDirection: "row",
    fontSize: 15,
    color: "var(--shade-6)",
  },
  enableCharacterProfilesContainer: {
    display: "none",
    justifyContent: "center",
    margin: "25px 0",
  },
  enabledCharacterProfiles: {
    fontSize: 14,
  },
  video: {
    width: 30,
    height: 30,
    borderRadius: "50%",
  },
  characterProfileActions: {
    display: "flex",
    gap: 1,
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    gap: 5,
    maxWidth: 300,
    fontSize: 12,
  },
} as const

import { createUnifiedStyles } from "chrry/styles/createUnifiedStyles"
import { createStyleHook } from "chrry/styles/createStyleHook"

export const MessagesStyles = createUnifiedStyles(MessagesStyleDefs)

// Type for the hook return value
type MessagesStylesHook = {
  [K in keyof typeof MessagesStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useMessagesStyles =
  createStyleHook<MessagesStylesHook>(MessagesStyles)
