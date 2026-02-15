/**
 * Generated from EventModal.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const EventModalStyleDefs = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    backgroundColor: "var(--background)",
    border: "1px solid var(--shade-2)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-lg)",
    width: "100%",
    maxWidth: 500,
    maxHeight: "90vh",
    overflowY: "auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px 16px",
    borderBottom: "1px solid var(--shade-2)",
    fontSize: 18,
    fontWeight: 600,
    margin: 0,
    color: "var(--text-primary)",
  },
  closeButton: {
    base: {
      backgroundColor: "none",
      border: "none",
      color: "var(--text-secondary)",
      padding: 4,
      borderRadius: "var(--radius)",
    },
    hover: {
      backgroundColor: "var(--shade-1)",
      color: "var(--text-primary)",
    },
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  field: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  fieldIcon: {
    color: "var(--text-secondary)",
    flexShrink: 0,
  },
  titleInput: {
    flex: 1,
    width: "100%",
  },
  input: {
    flex: 1,
    backgroundColor: "var(--shade-1)",
    border: "1px solid var(--shade-2)",
    borderRadius: "var(--radius)",
    padding: "12px 16px",
    fontSize: 14,
    color: "var(--text-primary)",
  },
  descriptionEdit: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    flex: 1,
    width: "100%",
  },
  descriptionEditButton: {
    alignSelf: "flex-start",
  },
  textarea: {
    minHeight: 120,
    width: "100%",
  },
  descriptionView: {
    width: "100%",
    minHeight: 80,
    color: "var(--text)",
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
  },
  allDayToggle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 0",
    width: 16,
    height: 16,
    fontSize: 14,
    color: "var(--text-primary)",
  },
  dateTimeSectionField: {
    alignItems: "center",
  },
  dateTimeGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 12,
    fontWeight: 500,
    color: "var(--text-secondary)",
  },
  dateTimeInput: {
    marginLeft: "auto",
    fontFamily: "var(--font-mono)",
    fontSize: 14,
  },
  error: {
    color: "var(--accent-0)",
    fontSize: 12,
  },
  fieldWrapperError: {
    textAlign: "right",
    marginTop: 5,
  },
  colorSection: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  colorLabel: {
    fontSize: 14,
    color: "var(--text-primary)",
    minWidth: 40,
  },
  colorOptions: {
    display: "flex",
  },
  colorOption: {
    base: {},
    hover: {
      transform: "scale(1.15)",
    },
  },
  colorOptionSelected: {
    borderColor: "var(--foreground)",
    transform: "scale(1.3)",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    paddingTop: 10,
    borderTop: "1px solid var(--shade-2)",
    flexWrap: "wrap",
  },
} as const

import { createUnifiedStyles } from "./styles/createUnifiedStyles"
import { useInteractiveStyles } from "./styles/useInteractiveStyles"

export const EventModalStyles = createUnifiedStyles(EventModalStyleDefs)

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
export type EventModalStylesHook = {
  [K in keyof typeof EventModalStyleDefs]: (typeof EventModalStyleDefs)[K] extends {
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
export const useEventModalStyles = (): EventModalStylesHook => {
  // Call all hooks upfront in a stable order (Rules of Hooks compliant)
  const styleResults: Partial<Record<keyof typeof EventModalStyleDefs, any>> =
    {}

  // Use Object.keys to ensure consistent iteration order across environments
  const keys = Object.keys(EventModalStyleDefs) as Array<
    keyof typeof EventModalStyleDefs
  >

  for (const className of keys) {
    const styleDef = EventModalStyleDefs[className]

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

  return styleResults as EventModalStylesHook
}
