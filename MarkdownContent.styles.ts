/**
 * Generated from MarkdownContent.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const MarkdownContentStyleDefs = {
  markdownContent: {
    width: "100%",
    overflowWrap: "break-word",
    color: "var(--shade-7)",
    margin: "0 !important",
    padding: "0 !important",
  },
  paragraph: {
    marginBottom: 0,
    lineHeight: 1.5,
  },
  codeBlockContainer: {
    margin: "1rem 0",
    borderRadius: 15,
    backgroundColor: "var(--shade-2)",
    overflow: "hidden",
    position: "relative",
  },
  codeBlockHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 1rem",
  },
  language: {
    fontSize: "0.8rem",
    color: "var(--foreground-secondary)",
    fontFamily: "var(--font-mono)",
    fontWeight: 600,
  },
  copyButton: {
    base: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 3,
      backgroundColor: "transparent",
      borderRadius: 10,
      color: "var(--accent-1)",
    },
    hover: {
      color: "var(--accent-1)",
    },
    active: {
      transform: "scale(0.95)",
    },
  },
  copyButtonCopied: {
    color: "var(--accent-4)",
  },
  codeBlock: {
    margin: "0 !important",
    fontSize: "0.9rem",
    maxWidth: "100%",
    overflowX: "auto",
    padding: "8px 5px !important",
    borderRadius: 15,
    backgroundColor: "#000",
    border: "1px solid var(--shade-2)",
  },
  inlineCode: {
    backgroundColor: "var(--shade-1)",
    padding: "0px 0px",
    borderRadius: 4,
    fontFamily: "monospace",
    fontSize: 14,
  },
  link: {
    base: {
      color: "var(--accent-1)",
      textDecorationLine: "underline",
    },
    hover: {
      textDecorationLine: "none",
    },
  },
  list: {
    marginBottom: "1rem",
    paddingLeft: "1.5rem",
  },
  orderedList: {
    marginBottom: "1rem",
    paddingLeft: "1.5rem",
  },
  listItem: {
    marginBottom: "0.5rem",
  },
  heading1: {
    fontSize: "1.5rem",
  },
  heading2: {
    fontSize: "1.3rem",
  },
  heading3: {
    fontSize: "1.1rem",
  },
  heading4: {
    fontSize: "1rem",
  },
  blockquote: {
    borderLeft: "4px solid var(--accent-2)",
    paddingLeft: "1rem",
    marginLeft: 0,
    marginRight: 0,
    color: "var(--text-2)",
  },
  table: {
    width: "100%",
    marginBottom: "1rem",
    overflowX: "auto",
    display: "block",
  },
  tableHead: {
    backgroundColor: "var(--shade-2)",
  },
  tableHeader: {
    border: "1px solid var(--shade-3)",
    padding: 1,
    textAlign: "left",
  },
  tableCell: {
    border: "1px solid var(--shade-3)",
    padding: 1,
    textAlign: "left",
  },
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const MarkdownContentStyles = createUnifiedStyles(
  MarkdownContentStyleDefs,
)

// Type for the hook return value
type MarkdownContentStylesHook = {
  [K in keyof typeof MarkdownContentStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useMarkdownContentStyles =
  createStyleHook<MarkdownContentStylesHook>(MarkdownContentStyles)
