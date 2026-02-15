/**
 * Generated from Threads.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const ThreadsStyleDefs = {
  threads: {
    width: "100%",
    maxWidth: 600,
    margin: "20px auto",
    display: "flex",
    flex: 1,
    flexDirection: "column",
    gap: 10,
    fontSize: 15,
    marginTop: 20,
  },
  threadsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    marginTop: 5,
  },
  threadsItem: {},
  characterProfiles: {
    display: "flex",
    gap: 5,
    flexDirection: "column",
    fontSize: 12,
    alignItems: "flex-start",
  },
  threadItemTitle: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    marginBottom: 5,
  },
  right: {
    display: "flex",
    gap: "8px 10px",
    marginLeft: "auto",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  threadItemDate: {
    fontSize: 11,
    color: "var(--shade-6)",
    marginLeft: "auto",
  },
  searchInput: {
    border: "1px dashed var(--accent-5) !important",
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  threadAiResponse: {
    margin: "0 0",
    fontSize: 13,
    color: "var(--shade-7)",
  },
  threadsTitle: {
    fontSize: 22,
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: 5,
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
  profileImage: {
    borderRadius: "50%",
  },
} as const

import { createUnifiedStyles } from "./styles/createUnifiedStyles"
import { createStyleHook } from "./styles/createStyleHook"

export const ThreadsStyles = createUnifiedStyles(ThreadsStyleDefs)

// Type for the hook return value
type ThreadsStylesHook = {
  [K in keyof typeof ThreadsStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useThreadsStyles =
  createStyleHook<ThreadsStylesHook>(ThreadsStyles)
