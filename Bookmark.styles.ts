/**
 * Generated from Bookmark.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const BookmarkStyleDefs = {
  star: {
    display: "inline-flex",
    fontSize: 12,
    color: "var(--shade-6)",
  },
  starActive: {
    display: "inline-flex",
  },
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const BookmarkStyles = createUnifiedStyles(BookmarkStyleDefs)

// Type for the hook return value
type BookmarkStylesHook = {
  [K in keyof typeof BookmarkStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useBookmarkStyles =
  createStyleHook<BookmarkStylesHook>(BookmarkStyles)
