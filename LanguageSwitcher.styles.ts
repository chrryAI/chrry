/**
 * Generated from LanguageSwitcher.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const LanguageSwitcherStyleDefs = {
  languages: {
    display: "flex",
    flexDirection: "row",
    gap: 15,
    fontSize: 14,
    maxWidth: 420,
    flexWrap: "wrap",
    marginTop: 3,
    justifyContent: "center",
  },
  languageButton: {
    fontSize: 14,
  },
  active: {
    color: "var(--shade-8)",
  },
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const LanguageSwitcherStyles = createUnifiedStyles(
  LanguageSwitcherStyleDefs,
)

// Type for the hook return value
type LanguageSwitcherStylesHook = {
  [K in keyof typeof LanguageSwitcherStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useLanguageSwitcherStyles =
  createStyleHook<LanguageSwitcherStylesHook>(LanguageSwitcherStyles)
