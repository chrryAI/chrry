import type { CSSProperties } from "react"
export type UnifiedStylesInput = Record<string, Record<string, any>>
export type NativeStyles = Record<string, Record<string, any>>
export type WebClasses = Record<string, string>
export type UnifiedStyles<T extends UnifiedStylesInput = UnifiedStylesInput> = {
  native: Record<keyof T, Record<string, any>>
  web: Record<keyof T, string>
  all: Record<keyof T, Record<string, T[keyof T]>>
}
export function createUnifiedStyles<T extends UnifiedStylesInput>(
  styleDefinitions: T,
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
        const normalizedValue = normalizeValue(prop, value)
        if (normalizedValue !== undefined && normalizedValue !== null) {
          nativeStyle[prop] = normalizedValue
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

function normalizeValue(prop: string, value: any): any {
  if (typeof value !== "number" && typeof value !== "string") {
    return value
  }

  // First, unwrap quoted strings
  let unwrappedValue = value
  if (
    typeof value === "string" &&
    (value.startsWith("'") || value.startsWith('"'))
  ) {
    unwrappedValue = value.slice(1, -1)
  }

  // Check if this is a multi-value property (contains spaces)
  // e.g., "10px 20px 30px 40px" for padding
  if (typeof unwrappedValue === "string" && unwrappedValue.includes(" ")) {
    // Keep multi-value strings as-is for web compatibility
    return unwrappedValue
  }

  // Single value conversions
  if (typeof unwrappedValue === "string" && unwrappedValue.endsWith("px")) {
    return parseInt(unwrappedValue)
  }

  if (typeof unwrappedValue === "string" && unwrappedValue.endsWith("rem")) {
    return Math.round(parseFloat(unwrappedValue) * 16)
  }

  if (typeof unwrappedValue === "string" && unwrappedValue.endsWith("em")) {
    return Math.round(parseFloat(unwrappedValue) * 16)
  }

  // For web: keep CSS variables as-is
  // For native: would need to resolve to actual colors from theme
  // This is a web-first implementation
  if (typeof unwrappedValue === "string" && unwrappedValue.includes("var(--")) {
    return unwrappedValue // Keep as-is for web
  }

  return unwrappedValue
}
