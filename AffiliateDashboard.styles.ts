/**
 * Generated from AffiliateDashboard.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const AffiliateDashboardStyleDefs = {
  loading: {
    textAlign: "center",
    marginTop: 50,
  },
  statusBadge: {
    padding: "2px 8px",
    borderRadius: 20,
    fontSize: 13,
    backgroundColor: "var(--shade-2)",
    color: "white",
  },
  linkSection: {
    marginBottom: "0.5rem",
    backgroundColor: "var(--background-secondary)",
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    gap: 13,
    flexWrap: "wrap",
    justifyContent: "center",
    flex: 1,
    color: "var(--accent-1)",
    marginTop: 5,
    textAlign: "center",
  },
  payoutSection: {
    textAlign: "center",
    margin: "20px 0",
    padding: 20,
  },
  payoutNote: {
    marginTop: 10,
    fontSize: 14,
    color: "var(--text-secondary)",
  },
  pendingPayoutInfo: {
    padding: 20,
    backgroundColor: "var(--shade-1)",
    border: "1px dashed var(--shade-3)",
    borderRadius: 20,
  },
  pendingBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: "var(--shade-0)",
    borderRadius: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  pendingAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "var(--accent-1)",
  },
  pendingDate: {
    fontSize: 14,
    color: "var(--text-secondary)",
    margin: "5px 0",
  },
  pendingNote: {
    fontSize: 14,
    color: "var(--text-secondary)",
  },
  statsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  statCard: {
    base: {
      padding: 10,
      borderRadius: 20,
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
      justifyContent: "center",
      minWidth: 150,
      backgroundColor: "var(--shade-1)",
      border: "1px dashed var(--shade-2)",
    },
    hover: {
      borderStyle: "solid",
      backgroundColor: "var(--shade-1)",
    },
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "var(--primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statContent: {
    flex: 1,
    textAlign: "center",
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "var(--text-secondary)",
    marginBottom: "0.25rem",
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: "bold",
  },
  referralsSection: {
    marginBottom: "1rem",
    fontSize: "1.5rem",
    textAlign: "center",
    margin: "20px 0",
  },
  referralsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  referralStat: {
    base: {
      padding: 15,
      borderRadius: 20,
      border: "1px dashed var(--shade-2)",
      textAlign: "center",
      minWidth: 130,
    },
    hover: {
      borderStyle: "solid",
      backgroundColor: "var(--shade-1)",
    },
  },
  referralLabel: {
    fontSize: "0.9rem",
    color: "var(--text-secondary)",
    marginBottom: "0.5rem",
  },
  referralValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "var(--primary)",
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    marginTop: 20,
  },
  logo: {
    color: "var(--foreground)",
  },
  goToDashboard: {
    marginTop: 10,
  },
} as const

import { createUnifiedStyles } from "chrry/styles/createUnifiedStyles"
import { useInteractiveStyles } from "chrry/styles/useInteractiveStyles"

export const AffiliateDashboardStyles = createUnifiedStyles(
  AffiliateDashboardStyleDefs,
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
export type AffiliateDashboardStylesHook = {
  [K in keyof typeof AffiliateDashboardStyleDefs]: (typeof AffiliateDashboardStyleDefs)[K] extends {
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
export const useAffiliateDashboardStyles = (): AffiliateDashboardStylesHook => {
  // Call all hooks upfront in a stable order (Rules of Hooks compliant)
  const styleResults: Partial<
    Record<keyof typeof AffiliateDashboardStyleDefs, any>
  > = {}

  // Use Object.keys to ensure consistent iteration order across environments
  const keys = Object.keys(AffiliateDashboardStyleDefs) as Array<
    keyof typeof AffiliateDashboardStyleDefs
  >

  for (const className of keys) {
    const styleDef = AffiliateDashboardStyleDefs[className]

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

  return styleResults as AffiliateDashboardStylesHook
}
