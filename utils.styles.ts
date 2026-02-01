/**
 * Generated from utils.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const UtilsStyleDefs = {
  button: {
    base: {
      padding: "8px 12px",
      backgroundColor: "var(--link-color)",
      color: "#fff",
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      border: "none",
      borderRadius: "var(--radius)",
      boxShadow: "var(--shadow)",
      fontSize: 14,
      lineHeight: 1.15,
    },
    hover: {
      backgroundColor: "var(--accent-5)",
      color: "#fff",
    },
    active: {
      transform: "translateY(1px)",
    },
    disabled: {
      cursor: "default",
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
    },
  },
  link: {
    base: {
      textDecorationLine: "none",
      color: "var(--accent-6)",
      backgroundColor: "transparent",
      boxShadow: "none",
      padding: 0,
      margin: 0,
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
    },
    hover: {
      textDecorationLine: "none",
      color: "var(--accent-5)",
      backgroundColor: "transparent",
    },
    active: {
      transform: "translateY(1px)",
    },
  },
  small: {
    padding: "6px 9px",
    fontSize: 14,
  },
  xSmall: {
    padding: "4px 7px",
    fontSize: 12,
  },
  large: {
    padding: "8px 20px",
    fontSize: 16,
  },
  transparent: {
    base: {
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
      border: "1px solid var(--shade-2)",
      boxShadow: "none",
    },
    hover: {
      backgroundColor: "var(--shade-1)",
      color: "var(--foreground)",
    },
  },
  inverted: {
    base: {
      backgroundColor: "var(--foreground)",
      color: "var(--background)",
      border: "1px solid var(--shade-2)",
      boxShadow: "none",
    },
    hover: {
      backgroundColor: "var(--shade-7)",
      color: "var(--background)",
    },
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
    flex: 1,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    flex: 1,
  },
  left: {
    marginRight: "auto",
  },
  right: {
    marginLeft: "auto",
  },
} as const

import { createUnifiedStyles } from "./styles/createUnifiedStyles"
import { useInteractiveStyles } from "./styles/useInteractiveStyles"

export const UtilsStyles = createUnifiedStyles(UtilsStyleDefs)

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
export type UtilsStylesHook = {
  [K in keyof typeof UtilsStyleDefs]: (typeof UtilsStyleDefs)[K] extends {
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
export const useUtilsStyles = (): UtilsStylesHook => {
  // Call all hooks upfront in a stable order (Rules of Hooks compliant)
  const styleResults: Partial<Record<keyof typeof UtilsStyleDefs, any>> = {}

  // Use Object.keys to ensure consistent iteration order across environments
  const keys = Object.keys(UtilsStyleDefs) as Array<keyof typeof UtilsStyleDefs>

  for (const className of keys) {
    const styleDef = UtilsStyleDefs[className]

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

  return styleResults as UtilsStylesHook
}
