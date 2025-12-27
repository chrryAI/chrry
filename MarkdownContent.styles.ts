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

import { createUnifiedStyles } from "./styles/createUnifiedStyles"
import { useInteractiveStyles } from "./styles/useInteractiveStyles"

export const MarkdownContentStyles = createUnifiedStyles(
  MarkdownContentStyleDefs,
)

// ---- Stronger types for style defs and hook results ----

// A minimal shape for a style object. You can expand this later to be more specific
// (e.g., union of CSS properties used across web/native).
type StyleObject = {
  [key: string]: string | number | boolean | StyleObject | undefined
}

// Interactive (hover/focus/etc.) style definition
type InteractiveStyleDef = {
  base: StyleObject
  hover?: StyleObject
  active?: StyleObject
  focus?: StyleObject
  disabled?: StyleObject
}

// Static style definition is simply a style object
type StaticStyleDef = StyleObject

// explicit static result shape for non-interactive classes
type StaticStyleResult = {
  style: StaticStyleDef
  handlers: Record<string, never>
  state: { isHovered: false; isPressed: false; isFocused: false }
}

// interactive style hook result (keeps your existing hook return type)
type InteractiveStyleResult = ReturnType<typeof useInteractiveStyles>

// Create a discriminated mapped type so each key gets the right result type
export type MarkdownContentStylesHook = {
  [K in keyof typeof MarkdownContentStyleDefs]: (typeof MarkdownContentStyleDefs)[K] extends {
    base: any
  }
    ? InteractiveStyleResult
    : StaticStyleResult
}

// Type guard to narrow a StyleDef to InteractiveStyleDef without using any casts
function isInteractiveStyleDef(def: unknown): def is InteractiveStyleDef {
  return (
    typeof def === "object" &&
    def !== null &&
    Object.prototype.hasOwnProperty.call(def, "base")
  )
}

// Create interactive style hooks (safe - calls hooks deterministically)
export const useMarkdownContentStyles = (): MarkdownContentStylesHook => {
  // Call all hooks upfront in a stable order (Rules of Hooks compliant)
  const styleResults: Partial<
    Record<keyof typeof MarkdownContentStyleDefs, any>
  > = {}

  // Use Object.keys to ensure consistent iteration order across environments
  const keys = Object.keys(MarkdownContentStyleDefs) as Array<
    keyof typeof MarkdownContentStyleDefs
  >

  for (const className of keys) {
    const styleDef = MarkdownContentStyleDefs[className]

    if (isInteractiveStyleDef(styleDef)) {
      // styleDef is narrowed to InteractiveStyleDef here (no any cast needed)
      const {
        base = {},
        hover = {},
        active = {},
        focus = {},
        disabled = {},
      } = styleDef

      // Call useInteractiveStyles for interactive styles
      styleResults[className] = useInteractiveStyles({
        baseStyle: base,
        hoverStyle: hover,
        activeStyle: active,
        focusStyle: focus,
        disabledStyle: disabled,
      })
    } else {
      // Static styles - no hook needed
      // styleDef is narrowed to StaticStyleDef here
      styleResults[className] = {
        style: styleDef as StaticStyleDef,
        handlers: {},
        state: { isHovered: false, isPressed: false, isFocused: false },
      }
    }
  }

  return styleResults as MarkdownContentStylesHook
}
