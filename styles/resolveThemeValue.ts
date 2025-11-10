/**
 * Theme value resolver utility
 * Resolves CSS variables, theme references, and toRem calls at runtime
 */

import type { Theme } from "./theme"

export function resolveThemeValue(value: any, theme: Theme): any {
  if (typeof value === "string") {
    // Resolve CSS variable placeholders to theme
    if (value.startsWith("__CSS_VAR__")) {
      const cssVar = value.replace("__CSS_VAR__", "")
      if (cssVar) {
        // Map CSS variable to theme property
        const themeMap: Record<string, keyof Theme> = {
          "--foreground": "foreground",
          "--background": "background",
          "--accent-0": "accent0",
          "--accent-1": "accent1",
          "--accent-2": "accent2",
          "--accent-3": "accent3",
          "--accent-4": "accent4",
          "--accent-5": "accent5",
          "--accent-6": "accent6",
          "--accent-7": "accent7",
          "--accent-8": "accent8",
          "--shade-1": "shade1",
          "--shade-2": "shade2",
          "--shade-3": "shade3",
          "--shade-4": "shade4",
          "--shade-5": "shade5",
          "--shade-6": "shade6",
          "--shade-7": "shade7",
          "--shade-8": "shade8",
          "--link-color": "linkColor",
          "--selection": "selection",
          "--overlay": "overlay",
          "--shadow": "shadow",
          "--shadow-glow": "shadowGlow",
        }
        const themeProp = themeMap[cssVar]
        if (themeProp) {
          return theme[themeProp]
        }
      }
      // Fallback: return as-is
      return value
    }

    // Resolve theme references
    if (value.startsWith("theme.")) {
      const themePath = value.split(".")
      return themePath.reduce((obj, key) => obj?.[key], { theme } as any)
    }

    // Resolve toRem.toRem() calls
    if (value.includes("toRem.toRem(")) {
      const match = value.match(/toRem\.toRem\(([0-9.-]+)\)/)
      if (match && match[1]) {
        return Math.round(parseFloat(match[1]))
      }
    }
  }
  return value
}
