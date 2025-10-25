/**
 * Generated from CollaborationTooltip.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const CollaborationTooltipStyleDefs = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 9998,
  },
  tooltip: {
    position: "fixed",
    backgroundColor: "var(--shade-0)",
    border: "1px solid var(--shade-2)",
    borderRadius: 16,
    boxShadow: 20,
    zIndex: 9999,
    minWidth: 320,
    maxWidth: 400,
    top: "50%",
    left: "50%",
  },
  positioned: {},
  positionedTop: {
    marginTop: -12,
  },
  positionedBottom: {
    marginTop: 12,
  },
  positionedLeft: {
    marginLeft: -12,
  },
  positionedRight: {
    marginLeft: 12,
  },
  arrow: {
    position: "absolute",
    width: 12,
    height: 12,
    backgroundColor: "var(--shade-0)",
    border: "1px solid var(--shade-2)",
    bottom: -6,
    left: -6,
    marginLeft: -6,
    top: "50%",
    right: -6,
    marginTop: -6,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px 0",
  },
  stepIndicator: {
    fontSize: 12,
    color: "var(--accent-4)",
    fontWeight: 600,
    backgroundColor: "var(--accent-1)",
    padding: "4px 8px",
    borderRadius: 6,
  },
  closeButton: {
    base: {
      backgroundColor: "none",
      border: "none",
      color: "var(--shade-4)",
      padding: 4,
      borderRadius: 4,
    },
    hover: {
      backgroundColor: "var(--shade-1)",
      color: "var(--shade-6)",
    },
  },
  content: {
    padding: "16px 20px",
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: "var(--shade-6)",
    margin: "0 0 8px 0",
  },
  description: {
    fontSize: 14,
    color: "var(--shade-5)",
    lineHeight: 1.5,
    margin: 0,
  },
  navigation: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px 20px",
    gap: 16,
  },
  navButton: {
    base: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "8px 16px",
      border: "1px solid var(--shade-2)",
      borderRadius: 8,
      backgroundColor: "var(--shade-1)",
      color: "var(--shade-6)",
      fontSize: 14,
      fontWeight: 500,
      borderColor: "var(--shade-3)",
    },
    disabled: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
  nextButton: {
    backgroundColor: "var(--accent-5)",
    color: "white",
    borderColor: "var(--accent-5)",
  },
  dots: {
    display: "flex",
    gap: 6,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "var(--shade-3)",
  },
  dotActive: {
    backgroundColor: "var(--accent-4)",
  },
} as const

import { createUnifiedStyles } from "chrry/styles/createUnifiedStyles"
import { useInteractiveStyles } from "chrry/styles/useInteractiveStyles"

export const CollaborationTooltipStyles = createUnifiedStyles(
  CollaborationTooltipStyleDefs,
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
export type CollaborationTooltipStylesHook = {
  [K in keyof typeof CollaborationTooltipStyleDefs]: (typeof CollaborationTooltipStyleDefs)[K] extends {
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
export const useCollaborationTooltipStyles =
  (): CollaborationTooltipStylesHook => {
    // Call all hooks upfront in a stable order (Rules of Hooks compliant)
    const styleResults: Partial<
      Record<keyof typeof CollaborationTooltipStyleDefs, any>
    > = {}

    // Use Object.keys to ensure consistent iteration order across environments
    const keys = Object.keys(CollaborationTooltipStyleDefs) as Array<
      keyof typeof CollaborationTooltipStyleDefs
    >

    for (const className of keys) {
      const styleDef = CollaborationTooltipStyleDefs[className]

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

    return styleResults as CollaborationTooltipStylesHook
  }
