/**
 * Generated from Store.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const StoreStyleDefs = {
  lifeOS: {
    maxWidth: 600,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    marginTop: 10,
    marginBottom: 30,
    padding: 5,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    marginBottom: 20,
  },
  title: {
    display: "flex",
    fontSize: 20,
    alignItems: "center",
    gap: 10,
    margin: 0,
    marginBottom: 5,
    flex: 1,
    textAlign: "center",
  },
  intro: {
    textAlign: "center",
    fontSize: 14,
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  createAgent: {
    display: "flex",
    justifyContent: "center",
    position: "relative",
    bottom: 10,
  },
  apps: {
    display: "flex",
    alignItems: "center",
    gap: 15,
    justifyContent: "center",
    marginTop: 10,
    flexWrap: "wrap",
  },
  titleText: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    textAlign: "center",
    flex: 1,
    alignSelf: "center",
    justifyContent: "center",
    fontWeight: 600,
  },
  headerIcons: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  app: {
    base: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      gap: 10,
      outline: "1px dashed var(--shade-2)",
      padding: 10,
      paddingTop: 13,
      borderRadius: 20,
      minWidth: 130,
      flex: 1,
      alignSelf: "flex-start",
    },
    hover: {
      outline: "2px solid var(--accent-1)",
    },
  },
  appInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  appName: {
    fontSize: 16,
    fontWeight: 600,
    textAlign: "center",
  },
  appSubtitle: {
    fontSize: 12,
    color: "var(--shade-5)",
    textAlign: "center",
    fontWeight: 400,
    maxWidth: 115,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  badge: {
    bottom: 1,
    right: 1,
    backgroundColor: "var(--accent-1)",
    color: "var(--shade-8)",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
    marginBottom: 10,
  },
  badgeInProgress: {
    backgroundColor: "var(--accent-5)",
  },
  badgePlanned: {
    backgroundColor: "var(--shade-3)",
  },
  appSelected: {
    outline: "3px solid var(--accent-5)",
    backgroundColor: "var(--shade-1)",
  },
  footer: {
    padding: 15,
    backgroundColor: "var(--shade-1)",
    borderRadius: 20,
    border: "1px dashed var(--shade-2)",
  },
  appDetails: {
    margin: "0 0 10px 0",
    fontSize: 24,
    fontWeight: 600,
  },
  subtitle: {
    margin: "0 0 5px 0",
    color: "var(--accent-1)",
    fontWeight: 500,
    fontSize: 16,
  },
  description: {
    margin: "0 0 20px 0",
    lineHeight: 1.6,
    color: "var(--shade-7)",
    fontSize: 15,
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  tetris: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 10,
    flexDirection: "column",
    fontSize: 12,
  },
} as const

import { createUnifiedStyles } from "chrry/styles/createUnifiedStyles"
import { useInteractiveStyles } from "chrry/styles/useInteractiveStyles"

export const StoreStyles = createUnifiedStyles(StoreStyleDefs)

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
export type StoreStylesHook = {
  [K in keyof typeof StoreStyleDefs]: (typeof StoreStyleDefs)[K] extends {
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
export const useStoreStyles = (): StoreStylesHook => {
  // Call all hooks upfront in a stable order (Rules of Hooks compliant)
  const styleResults: Partial<Record<keyof typeof StoreStyleDefs, any>> = {}

  // Use Object.keys to ensure consistent iteration order across environments
  const keys = Object.keys(StoreStyleDefs) as Array<keyof typeof StoreStyleDefs>

  for (const className of keys) {
    const styleDef = StoreStyleDefs[className]

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

  return styleResults as StoreStylesHook
}
