/**
 * Generated from Search.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const SearchStyleDefs = {
  searchBoxWrapper: {
    width: "100%",
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: 12,
    color: "var(--shade-6)",
    width: 16,
    height: 16,
  },
  search: {
    border: "1px solid var(--shade-2)",
    borderRadius: 20,
    padding: "10px 10px 10px 35px",
    width: "100%",
    backgroundColor: "var(--background)",
    color: "var(--foreground)",
    fontSize: 16,
  },
} as const

import { createUnifiedStyles } from "./styles/createUnifiedStyles"
import { createStyleHook } from "./styles/createStyleHook"

export const SearchStyles = createUnifiedStyles(SearchStyleDefs)

// Type for the hook return value
type SearchStylesHook = {
  [K in keyof typeof SearchStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useSearchStyles = createStyleHook<SearchStylesHook>(SearchStyles)
