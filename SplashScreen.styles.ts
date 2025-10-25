/**
 * Generated from SplashScreen.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const SplashScreenStyleDefs = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)",
  },
  content: {
    maxWidth: 1200,
    width: "100%",
    textAlign: "center",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  logoIcon: {
    fontSize: 64,
    lineHeight: 1,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 700,
    margin: 0,
    color: "var(--foreground)",
  },
  description: {
    fontSize: 20,
    color: "var(--shade-6)",
    marginBottom: 40,
    maxWidth: 600,
    marginLeft: "auto",
    marginRight: "auto",
  },
  links: {
    display: "flex",
    gap: 16,
    justifyContent: "center",
    marginBottom: 48,
  },
  link: {
    base: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "toRem(12) toRem(24)",
      backgroundColor: "var(--background)",
      border: "1px solid var(--shade-2)",
      borderRadius: 8,
      color: "var(--foreground)",
      textDecorationLine: "none",
      fontWeight: 500,
    },
    hover: {
      backgroundColor: "var(--shade-1)",
      borderColor: "var(--shade-3)",
      transform: -2,
    },
  },
  features: {
    display: "grid",
    gap: 24,
    marginBottom: 48,
  },
  featureIcon: {
    fontSize: 32,
    lineHeight: 1,
    flexShrink: 0,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 600,
    margin: "0 0 toRem(8) 0",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  openSourceBadge: {
    fontSize: 12,
    fontWeight: 500,
    padding: "toRem(2) toRem(8)",
    backgroundColor: "var(--accent-2)",
    color: "var(--accent-8)",
    borderRadius: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "var(--shade-6)",
    margin: 0,
  },
  featureArrow: {
    flexShrink: 0,
    color: "var(--shade-5)",
    transform: 4,
  },
  install: {
    padding: "toRem(8) toRem(16)",
    backgroundColor: "var(--shade-1)",
    border: "1px solid var(--shade-2)",
    borderRadius: 6,
    fontFamily: '"Monaco", "Courier New", monospace',
    fontSize: 14,
    color: "var(--accent-7)",
  },
} as const

import { createUnifiedStyles } from "chrry/styles/createUnifiedStyles"
import { useInteractiveStyles } from "chrry/styles/useInteractiveStyles"

export const SplashScreenStyles = createUnifiedStyles(SplashScreenStyleDefs)

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
export type SplashScreenStylesHook = {
  [K in keyof typeof SplashScreenStyleDefs]: (typeof SplashScreenStyleDefs)[K] extends {
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
export const useSplashScreenStyles = (): SplashScreenStylesHook => {
  // Call all hooks upfront in a stable order (Rules of Hooks compliant)
  const styleResults: Partial<Record<keyof typeof SplashScreenStyleDefs, any>> =
    {}

  // Use Object.keys to ensure consistent iteration order across environments
  const keys = Object.keys(SplashScreenStyleDefs) as Array<
    keyof typeof SplashScreenStyleDefs
  >

  for (const className of keys) {
    const styleDef = SplashScreenStyleDefs[className]

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

  return styleResults as SplashScreenStylesHook
}
