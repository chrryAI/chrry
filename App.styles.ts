/**
 * Generated from App.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const AppStyleDefs = {
  container: {
    display: "flex",
    gap: 9,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 5,
  },
  title: {
    fontDisplay: "swap",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontSize: "clamp(1.2rem, 4vw, 1.625rem)",
    margin: "0 0 0 0",
    gap: 5,
    marginBottom: 8,
  },
  appsGrid: {
    position: "relative",
    width: "100%",
    maxWidth: 300,
    padding: "0 10px",
  },
  apps: {
    position: "relative",
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    margin: "0 auto",
  },
  spaceInvader: {
    position: "relative",
    right: -5,
  },
  appItem: {},
  pacMan: {
    position: "absolute",
    left: -2,
    bottom: 2,
  },
  chrry: {
    position: "relative",
    left: -5,
  },
  grip: {},
  instructions: {},
  section: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  sectionLast: {
    display: "none",
  },
  field: {
    display: "flex",
  },
  nameField: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    position: "relative",
    backgroundColor: "var(--foreground)",
    color: "var(--background)",
    padding: "3px 13px",
    borderRadius: 25,
  },
  infoIcon: {
    position: "relative",
    top: 2,
  },
  nameInput: {
    base: {
      border: "none",
      outline: "none",
      backgroundColor: "transparent",
      color: "var(--text-1)",
      fontSize: 16,
      paddingLeft: 5,
      width: "100%",
      maxWidth: 95,
    },
    hover: {
      backgroundColor: "transparent",
      border: "none",
      cursor: "pointer",
    },
  },
  icons: {},
  titleInput: {
    paddingTop: 12,
    paddingBottom: 12,
    minWidth: 250,
    borderRadius: 25,
    borderStyle: "dashed",
  },
  appImage: {
    borderRadius: "20%",
  },
  appImageWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    position: "relative",
  },
  editImageButton: {
    padding: "3px !important",
    position: "absolute",
    bottom: -4,
    right: -5,
  },
  error: {
    color: "var(--accent-0)",
    fontSize: 12,
  },
  info: {
    color: "var(--shade-7)",
    fontSize: 12,
    position: "absolute",
    top: -25,
    left: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    textAlign: "center",
    minWidth: 250,
    transform: -85,
  },
  infoError: {
    color: "var(--accent-0)",
  },
  agentNameForm: {
    marginBottom: 4,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  appTitle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  titleFormContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    position: "relative",
  },
  titleFormTitle: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    position: "relative",
  },
  validationFeedback: {
    color: "var(--shade-7)",
    fontSize: 12,
    fontWeight: "normal",
    maxWidth: 250,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  appImageContainer: {
    position: "relative",
  },
  removeImageButton: {
    position: "absolute",
    top: -15,
    left: -15,
  },
  nameImage: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
} as const

import { createUnifiedStyles } from "chrry/styles/createUnifiedStyles"
import { useInteractiveStyles } from "chrry/styles/useInteractiveStyles"

export const AppStyles = createUnifiedStyles(AppStyleDefs)

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
export type AppStylesHook = {
  [K in keyof typeof AppStyleDefs]: (typeof AppStyleDefs)[K] extends {
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
export const useAppStyles = (): AppStylesHook => {
  // Call all hooks upfront in a stable order (Rules of Hooks compliant)
  const styleResults: Partial<Record<keyof typeof AppStyleDefs, any>> = {}

  // Use Object.keys to ensure consistent iteration order across environments
  const keys = Object.keys(AppStyleDefs) as Array<keyof typeof AppStyleDefs>

  for (const className of keys) {
    const styleDef = AppStyleDefs[className]

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

  return styleResults as AppStylesHook
}
