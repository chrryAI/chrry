/**
 * Generated from CharacterProfiles.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const CharacterProfilesStyleDefs = {
  video: {
    width: 30,
    height: 30,
    objectFit: "cover",
    borderRadius: "50%",
  },
  characterProfilesActions: {
    display: "flex",
    marginTop: 10,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  characterProfilesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  characterProfileButton: {},
  characterProfile: {
    margin: 0,
  },
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const CharacterProfilesStyles = createUnifiedStyles(
  CharacterProfilesStyleDefs,
)

// Type for the hook return value
type CharacterProfilesStylesHook = {
  [K in keyof typeof CharacterProfilesStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useCharacterProfilesStyles =
  createStyleHook<CharacterProfilesStylesHook>(CharacterProfilesStyles)
