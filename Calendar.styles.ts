/**
 * Generated from Calendar.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const CalendarStyleDefs = {
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100dvh",
  },
  loading: {
    position: "relative",
    bottom: 100,
  },
  dateButton: {
    base: {
      padding: 2,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "50%",
      width: 24,
      height: 24,
      border: "none",
      fontSize: 14,
      fontFamily: "var(--font-mono)",
      fontWeight: 500,
    },
    hover: {
      backgroundColor: "var(--accent-6)",
    },
  },
  dateHeader: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    alignItems: "space-between",
    justifyContent: "space-between",
    padding: "0 0 0 5px",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  toolbarSection: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  toolbarLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  rbcAgendaDateCell: {
    backgroundColor: "var(--background-secondary)",
    borderRight: "1px solid var(--border)",
    padding: 12,
    fontWeight: 600,
  },
  rbcAgendaTimeCell: {
    backgroundColor: "var(--background-secondary)",
    borderRight: "1px solid var(--border)",
    padding: 12,
    fontSize: 12,
  },
  rbcAgendaEventCell: {
    padding: 12,
    borderBottom: "1px solid var(--shade-2)",
  },
  rbcAddonsDndDragPreview: {
    backgroundColor: "var(--primary)",
    border: "2px solid var(--primary-dark)",
    borderRadius: 4,
    opacity: 0.8,
    transform: "rotate(5deg)",
  },
  rbcAddonsDndOver: {
    backgroundColor: "var(--primary-light)",
    border: "2px dashed var(--primary) !important",
  },
  rbcAddonsDndDragRow: {
    borderLeft: "4px solid var(--primary)",
    backgroundColor: "var(--primary-light)",
  },
  rbcAddonsDndResizeNsAnchor: {
    backgroundColor: "var(--primary)",
    border: "1px solid var(--primary-dark)",
  },
  rbcAddonsDndResizeEwAnchor: {
    backgroundColor: "var(--primary)",
    border: "1px solid var(--primary-dark)",
  },
  calendarPurple: {
    backgroundColor: "#863dcf",
  },
  calendarRed: {
    backgroundColor: "#dd2f2f",
  },
  calendarOrange: {
    backgroundColor: "#f5a623",
  },
  calendarBlue: {
    backgroundColor: "#197ef4",
  },
  calendarGreen: {
    backgroundColor: "#58aa11",
  },
  calendarViolet: {
    backgroundColor: "#f832e7",
  },
  calendarRbcOffRange: {
    backgroundColor: "var(--background-disabled)",
    color: "var(--text-disabled)",
  },
  calendarLoading: {
    opacity: 0.6,
  },
  viewButtons: {
    display: "flex",
    gap: 4,
  },
  viewButtonsActive: {
    backgroundColor: "var(--primary)",
    color: "white",
    borderColor: "var(--primary)",
  },
} as const

import { createUnifiedStyles } from "./styles/createUnifiedStyles"
import { useInteractiveStyles } from "./styles/useInteractiveStyles"

export const CalendarStyles = createUnifiedStyles(CalendarStyleDefs)

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
export type CalendarStylesHook = {
  [K in keyof typeof CalendarStyleDefs]: (typeof CalendarStyleDefs)[K] extends {
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
export const useCalendarStyles = (): CalendarStylesHook => {
  // Call all hooks upfront in a stable order (Rules of Hooks compliant)
  const styleResults: Partial<Record<keyof typeof CalendarStyleDefs, any>> = {}

  // Use Object.keys to ensure consistent iteration order across environments
  const keys = Object.keys(CalendarStyleDefs) as Array<
    keyof typeof CalendarStyleDefs
  >

  for (const className of keys) {
    const styleDef = CalendarStyleDefs[className]

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

  return styleResults as CalendarStylesHook
}
