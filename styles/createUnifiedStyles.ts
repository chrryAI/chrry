import { resolveCssVar } from "./theme"

export type UnifiedStylesInput = Record<string, Record<string, any>>
export type NativeStyles = Record<string, Record<string, any>>
export type WebClasses = Record<string, string>
export type UnifiedStyles<T extends UnifiedStylesInput = UnifiedStylesInput> = {
  native: Record<keyof T, Record<string, any>>
  web: Record<keyof T, string>
  all: Record<keyof T, Record<string, T[keyof T]>>
}

/**
 * Options for style normalization
 */
export interface NormalizeOptions {
  forNative?: boolean
  theme?: any
}

export function createUnifiedStyles<T extends UnifiedStylesInput>(
  styleDefinitions: T,
  options: NormalizeOptions = {},
): UnifiedStyles<T> {
  // Safety check: ensure styleDefinitions exists
  if (!styleDefinitions || typeof styleDefinitions !== "object") {
    console.warn(
      "createUnifiedStyles: styleDefinitions is undefined or invalid",
    )
    return {
      native: {} as Record<keyof T, Record<string, any>>,
      web: {} as Record<keyof T, string>,
      all: {} as Record<keyof T, Record<string, any>>,
    }
  }

  const nativeStyles: Record<string, Record<string, any>> = {}
  const webCssModules: Record<string, string> = {}

  Object.entries(styleDefinitions).forEach(([className, styleObj]) => {
    const nativeStyle: Record<string, any> = {}

    // Safety check for styleObj
    if (styleObj && typeof styleObj === "object") {
      Object.entries(styleObj).forEach(([prop, value]) => {
        const normalized = normalizeValue(prop, value, options)

        // Handle border shorthand expansion for native
        if (
          typeof normalized === "object" &&
          normalized !== null &&
          !Array.isArray(normalized)
        ) {
          Object.assign(nativeStyle, normalized)
        } else if (normalized !== undefined && normalized !== null) {
          nativeStyle[prop] = normalized
        }
      })
    }

    nativeStyles[className] = nativeStyle
    webCssModules[className] = className
  })

  return {
    native: nativeStyles as Record<keyof T, Record<string, any>>,
    web: webCssModules as Record<keyof T, string>,
    all: nativeStyles as Record<keyof T, Record<string, any>>,
  }
}

function normalizeValue(
  prop: string,
  value: any,
  options: NormalizeOptions = {},
): any {
  if (typeof value !== "number" && typeof value !== "string") {
    return value
  }

  const { forNative = false, theme } = options

  // First, unwrap quoted strings
  let unwrappedValue = value
  if (
    typeof value === "string" &&
    (value.startsWith("'") || value.startsWith('"'))
  ) {
    unwrappedValue = value.slice(1, -1)
  }

  // Handle border shorthand for React Native
  // Convert "1px solid #color" to { borderWidth: 1, borderStyle: "solid", borderColor: "#color" }
  if (
    forNative &&
    (prop === "border" ||
      prop === "borderTop" ||
      prop === "borderRight" ||
      prop === "borderBottom" ||
      prop === "borderLeft")
  ) {
    if (typeof unwrappedValue === "string" && unwrappedValue.includes(" ")) {
      const parts = unwrappedValue.split(" ")
      const width = parts[0]
      const style = parts[1] || "solid"
      const color = parts.slice(2).join(" ") || "#000"

      const prefix = prop === "border" ? "border" : prop
      return {
        [`${prefix}Width`]: width?.endsWith("px")
          ? Number.parseInt(width, 10)
          : 1,
        [`${prefix}Style`]: style,
        [`${prefix}Color`]: theme ? resolveCssVar(color, theme, false) : color,
      }
    }
  }

  // Check if this is a multi-value property (contains spaces)
  // e.g., "10px 20px 30px 40px" for padding
  if (
    typeof unwrappedValue === "string" &&
    unwrappedValue.includes(" ") &&
    !unwrappedValue.includes("var(--")
  ) {
    // Keep multi-value strings as-is for web compatibility
    return unwrappedValue
  }

  // Single value conversions
  if (typeof unwrappedValue === "string" && unwrappedValue.endsWith("px")) {
    return Number.parseInt(unwrappedValue, 10)
  }

  if (typeof unwrappedValue === "string" && unwrappedValue.endsWith("rem")) {
    return Math.round(parseFloat(unwrappedValue) * 16)
  }

  if (typeof unwrappedValue === "string" && unwrappedValue.endsWith("em")) {
    return Math.round(parseFloat(unwrappedValue) * 16)
  }

  // CSS variables: resolve for native, keep for web
  if (typeof unwrappedValue === "string" && unwrappedValue.includes("var(--")) {
    if (forNative && theme) {
      return resolveCssVar(unwrappedValue, theme, false)
    }
    return unwrappedValue // Keep as-is for web
  }

  return unwrappedValue
}

/**
 * Runtime helper to resolve CSS variables in styles
 * Use this in style hooks to support React Native
 */
export function resolveStylesForPlatform(
  styles: Record<string, any>,
  theme: any,
  isWeb: boolean = true,
): Record<string, any> {
  if (isWeb) return styles

  const resolved: Record<string, any> = {}

  for (const [key, value] of Object.entries(styles)) {
    if (typeof value === "string" && value.includes("var(--")) {
      resolved[key] = resolveCssVar(value, theme, false)
    } else if (typeof value === "object" && value !== null) {
      resolved[key] = resolveStylesForPlatform(value, theme, isWeb)
    } else {
      resolved[key] = value
    }
  }

  return resolved
}
