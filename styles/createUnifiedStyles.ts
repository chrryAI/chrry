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
  const nativeStyles: Record<string, Record<string, any>> = {}
  const webCssModules: Record<string, string> = {}

  Object.entries(styleDefinitions).forEach(([className, styleObj]) => {
    const nativeStyle: Record<string, any> = {}

    Object.entries(styleObj).forEach(([prop, value]) => {
      const normalizedValue = normalizeValue(prop, value)
      if (normalizedValue !== undefined && normalizedValue !== null) {
        nativeStyle[prop] = normalizedValue
      }
    })

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

  if (typeof value === "string" && value.endsWith("px")) {
    return parseInt(value)
  }

  if (typeof value === "string" && value.endsWith("rem")) {
    return Math.round(parseFloat(value) * 16)
  }

  if (typeof value === "string" && value.endsWith("em")) {
    return Math.round(parseFloat(value) * 16)
  }

  if (
    typeof value === "string" &&
    (value.startsWith("'") || value.startsWith('"'))
  ) {
    return value.slice(1, -1)
  }

  // For web: keep CSS variables as-is
  // For native: would need to resolve to actual colors from theme
  // This is a web-first implementation
  if (typeof value === "string" && value.includes("var(--")) {
    return value // Keep as-is for web
  }

  return value
}
