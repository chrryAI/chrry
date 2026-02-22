/**
 * Utility styles for common layout patterns
 * Replaces global CSS classes like .row, .column, etc.
 */

import { useTheme } from "./theme"

export const utilities = {
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5, // 0.3125rem * 16
    flexWrap: "wrap",
  },

  column: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },

  left: {
    marginRight: "auto",
  },

  right: {
    marginLeft: "auto",
  },

  link: {
    textDecoration: "none",
    cursor: "pointer",
    backgroundColor: "transparent",
    boxShadow: "none",
    padding: 0,
    margin: 0,
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
  },
} as const

// Helper to merge utility styles with component styles
export const mergeStyles = (
  ...styles: Array<Record<string, any> | undefined>
) => {
  return Object.assign({}, ...styles.filter(Boolean))
}

// Hook to get utilities with theme colors
export const useUtilities = () => {
  const theme = useTheme()

  return {
    ...utilities,
    // Theme-aware link (overrides static version)
    link: {
      ...utilities.link,
      color: theme.linkColor,
    },
    // Add theme-aware utilities
    card: {
      backgroundColor: theme.background,
      borderRadius: theme.radius,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.16,
      shadowRadius: 25,
      elevation: 5, // For Android
    },
    divider: {
      height: 1,
      backgroundColor: theme.shade2,
      width: "100%",
    },
  }
}
