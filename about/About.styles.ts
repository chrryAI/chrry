/**
 * Generated from About.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const AboutStyleDefs = {
  ossLink: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  oss: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  ossWrapper: {
    marginBottom: 20,
    display: "flex",
    flexDirection: "column",
  },
  ossContainer: {
    display: "flex",
    gap: 15,
    flexDirection: "column",
  },
  ossContainerDesktop: {
    flexDirection: "row",
    alignItems: "center",
  },
  apps: {
    display: "flex",
    flexWrap: "wrap",
    gap: 15,
    margin: "15px 0",
  },
  app: {
    base: {
      flex: 1,
      minWidth: 200,
      padding: 15,
      border: "1px dashed var(--shade-2)",
      borderRadius: 20,
      display: "flex",
      flexDirection: "column",
      gap: 5,
      margin: 0,
      fontSize: 15,
      marginBottom: 8,
    },
    hover: {
      border: "1px solid var(--accent-1)",
      backgroundColor: "var(--shade-1)",
    },
  },
  h2: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  signInButton: {
    marginLeft: "auto",
    fontSize: 13,
  },
  appDescription: {
    fontSize: 13,
    color: "var(--shade-6)",
  },
  video: {
    width: "100%",
    maxWidth: "100%",
    marginTop: 10,
    borderRadius: 10,
  },
  copyright: {
    marginBottom: 20,
  },
  lastUpdated: {
    fontSize: 13,
    color: "var(--shade-6)",
    display: "flex",
    alignItems: "center",
    gap: 5,
    marginTop: 20,
  },
} as const

import { createUnifiedStyles } from "../styles/createUnifiedStyles"
import { useInteractiveStyles } from "../styles/useInteractiveStyles"

export const AboutStyles = createUnifiedStyles(AboutStyleDefs)

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
export type AboutStylesHook = {
  [K in keyof typeof AboutStyleDefs]: (typeof AboutStyleDefs)[K] extends {
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
export const useAboutStyles = (): AboutStylesHook => {
  // Call all hooks upfront in a stable order (Rules of Hooks compliant)
  const styleResults: Partial<Record<keyof typeof AboutStyleDefs, any>> = {}

  // Use Object.keys to ensure consistent iteration order across environments
  const keys = Object.keys(AboutStyleDefs) as Array<keyof typeof AboutStyleDefs>

  for (const className of keys) {
    const styleDef = AboutStyleDefs[className]

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

  return styleResults as AboutStylesHook
}
