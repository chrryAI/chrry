/**
 * Generated from Users.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const UsersStyleDefs = {
  users: {
    width: "100%",
    maxWidth: 600,
    margin: "0 auto",
    display: "flex",
    flex: 1,
    flexDirection: "column",
    gap: 10,
    fontSize: 15,
  },
  searchInput: {
    border: "1px dashed var(--accent-5) !important",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  usersTitle: {
    marginTop: 0,
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  usersContainer: {
    display: "flex",
    flexDirection: "column",
  },
  usersItem: {
    display: "flex",
    gap: 10,
    flexDirection: "column",
    borderBottom: "none",
    padding: "15px 0",
  },
  profileImage: {
    borderRadius: "50%",
  },
  usersItemUserImage: {
    display: "flex",
    gap: 5,
    alignItems: "center",
  },
  usersItemUser: {
    display: "flex",
    gap: 15,
    alignItems: "center",
  },
  usersItemCharacterProfiles: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    alignItems: "flex-start",
  },
  usersItemCharacterProfile: {
    display: "flex",
    gap: 5,
    alignItems: "center",
  },
  tags: {
    fontSize: 12,
  },
  loadMoreButton: {
    fontSize: 13,
    padding: "5px 10px",
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  loadMoreButtonContainer: {
    display: "flex",
    justifyContent: "center",
  },
} as const

import { createUnifiedStyles } from "./styles/createUnifiedStyles"
import { createStyleHook } from "./styles/createStyleHook"

export const UsersStyles = createUnifiedStyles(UsersStyleDefs)

// Type for the hook return value
type UsersStylesHook = {
  [K in keyof typeof UsersStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useUsersStyles = createStyleHook<UsersStylesHook>(UsersStyles)
