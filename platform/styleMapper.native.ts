/**
 * Style Mapper - Converts className to React Native styles
 *
 * This utility allows you to use className on native platforms
 * by automatically converting CSS classes to React Native style objects
 */

import { ViewStyle, TextStyle, ImageStyle } from "react-native"

type StyleObject = ViewStyle | TextStyle | ImageStyle

// Cache for parsed styles
const styleCache = new Map<string, StyleObject>()

/**
 * Parse a className string and convert to React Native styles
 * Supports:
 * - Imported CSS modules (styles.app) via styleRegistry
 * - Utility classes (flex, items-center, etc.)
 */
export function classNameToStyle(
  className: string | undefined,
  styleRegistry?: Map<string, Record<string, any>>,
): StyleObject {
  if (!className) return {}

  // Check cache
  const cacheKey = `${className}-${styleRegistry?.size || 0}`
  if (styleCache.has(cacheKey)) {
    return styleCache.get(cacheKey)!
  }

  const classes = className.split(" ").filter(Boolean)
  const combinedStyle: StyleObject = {}

  for (const cls of classes) {
    // Try to find in style registry first (from .styles.ts files)
    if (styleRegistry && styleRegistry.has(cls)) {
      Object.assign(combinedStyle, styleRegistry.get(cls))
      continue
    }

    // Parse utility classes (Tailwind-like)
    const utilityStyle = parseUtilityClass(cls)
    if (utilityStyle) {
      Object.assign(combinedStyle, utilityStyle)
    }
  }

  // Cache the result
  styleCache.set(cacheKey, combinedStyle)
  return combinedStyle
}

/**
 * Parse common utility classes to React Native styles
 */
function parseUtilityClass(className: string): StyleObject | null {
  // Flexbox
  if (className === "flex") return { display: "flex" }
  if (className === "flex-row") return { flexDirection: "row" }
  if (className === "flex-col") return { flexDirection: "column" }
  if (className === "items-center") return { alignItems: "center" }
  if (className === "items-start") return { alignItems: "flex-start" }
  if (className === "items-end") return { alignItems: "flex-end" }
  if (className === "justify-center") return { justifyContent: "center" }
  if (className === "justify-start") return { justifyContent: "flex-start" }
  if (className === "justify-end") return { justifyContent: "flex-end" }
  if (className === "justify-between")
    return { justifyContent: "space-between" }
  if (className === "flex-1") return { flex: 1 }
  if (className === "flex-wrap") return { flexWrap: "wrap" }

  // Positioning
  if (className === "absolute") return { position: "absolute" }
  if (className === "relative") return { position: "relative" }

  // Display
  if (className === "hidden") return { display: "none" }

  // Text alignment
  if (className === "text-center") return { textAlign: "center" }
  if (className === "text-left") return { textAlign: "left" }
  if (className === "text-right") return { textAlign: "right" }

  // Font weight
  if (className === "font-bold") return { fontWeight: "bold" as const }
  if (className === "font-normal") return { fontWeight: "normal" as const }

  // Spacing (simplified - you can expand this)
  if (className.startsWith("p-")) {
    const value = parseInt(className.substring(2)) * 4
    return { padding: value }
  }
  if (className.startsWith("m-")) {
    const value = parseInt(className.substring(2)) * 4
    return { margin: value }
  }
  if (className.startsWith("gap-")) {
    const value = parseInt(className.substring(4)) * 4
    return { gap: value }
  }

  // Width/Height
  if (className === "w-full") return { width: "100%" }
  if (className === "h-full") return { height: "100%" }

  // Opacity
  if (className.startsWith("opacity-")) {
    const value = parseInt(className.substring(8)) / 100
    return { opacity: value }
  }

  return null
}

/**
 * Merge className and style prop for React Native
 */
export function mergeStyles(
  className: string | undefined,
  style: StyleObject | undefined,
  styleRegistry?: Map<string, Record<string, any>>,
): StyleObject {
  const classStyle = classNameToStyle(className, styleRegistry)

  if (!style) return classStyle
  if (Object.keys(classStyle).length === 0) return style

  return { ...classStyle, ...style }
}
