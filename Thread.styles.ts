/**
 * Generated from Thread.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const ThreadStyleDefs = {
  thread: {
    maxWidth: 600,
    marginTop: 5,
    marginRight: "auto",
    marginBottom: 0,
    marginLeft: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    fontSize: 15,
    padding: "0 10px 195px 10px",
    width: "100%",
  },
  threadEmpty: {
    marginTop: "auto",
    padding: "0 0px 160px 0px",
  },
  hourlyLimit: {
    fontSize: 12,
    color: "var(--shade-6)",
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  likeButton: {
    base: {
      fontSize: 12,
      color: "var(--shade-6)",
    },
    hover: {
      color: "var(--accent-1)",
    },
  },
  headers: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 5,
  },
  header: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  chatTop: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: 30,
    width: "100%",
    height: "100%",
    flex: 1,
    alignItems: "center",
    gap: 5,
  },
  errorContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: 30,
    width: "100%",
    height: "100%",
    flex: 1,
    alignItems: "center",
    gap: 5,
  },
} as const

import { createUnifiedStyles } from "./styles/createUnifiedStyles"
import { useInteractiveStyles } from "./styles/useInteractiveStyles"

export const ThreadStyles = createUnifiedStyles(ThreadStyleDefs)

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
export type ThreadStylesHook = {
  [K in keyof typeof ThreadStyleDefs]: (typeof ThreadStyleDefs)[K] extends {
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
export const useThreadStyles = (): ThreadStylesHook => {
  // Call all hooks upfront in a stable order (Rules of Hooks compliant)
  const styleResults: Partial<Record<keyof typeof ThreadStyleDefs, any>> = {}

  // Use Object.keys to ensure consistent iteration order across environments
  const keys = Object.keys(ThreadStyleDefs) as Array<
    keyof typeof ThreadStyleDefs
  >

  for (const className of keys) {
    const styleDef = ThreadStyleDefs[className]

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

  return styleResults as ThreadStylesHook
}
