/**
 * Style Mapper - Web version
 *
 * On web, className is handled natively by the browser,
 * so this is mostly a pass-through with some utility functions
 */

type StyleObject = Record<string, any>

// Cache for parsed styles
const styleCache = new Map<string, StyleObject>()

/**
 * Parse a className string and convert to inline styles (web fallback)
 * On web, className is usually handled by CSS, but this provides
 * a fallback for programmatic style generation
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
 * Parse common utility classes to inline styles
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
  if (className === "font-bold") return { fontWeight: "bold" }
  if (className === "font-normal") return { fontWeight: "normal" }

  // Spacing (simplified - you can expand this)
  if (className.startsWith("p-")) {
    const value = parseInt(className.substring(2)) * 4
    return { padding: `${value}px` }
  }
  if (className.startsWith("m-")) {
    const value = parseInt(className.substring(2)) * 4
    return { margin: `${value}px` }
  }
  if (className.startsWith("gap-")) {
    const value = parseInt(className.substring(4)) * 4
    return { gap: `${value}px` }
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
 * Merge className and style prop
 * On web, this is mainly for programmatic style generation
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
