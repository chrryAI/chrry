/**
 * Cross-platform clsx utility
 *
 * On web: returns className string
 * On native: returns merged style object
 */
import React from "react"
import clsxOriginal from "clsx"

type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | { [key: string]: boolean | undefined | null }
  | ClassValue[]

// Detect platform without importing react-native on web
const getPlatform = (): "web" | "native" => {
  if (typeof window !== "undefined") {
    return "web"
  }
  return "native"
}

const PLATFORM = getPlatform()
const isWeb = PLATFORM === "web"
const testNativeOnWeb =
  typeof process !== "undefined" &&
  process.env.EXPO_PUBLIC_TEST_NATIVE_WEB === "true"

/**
 * Platform-aware clsx with stylesheet support
 *
 * On web: works like normal clsx, returns className string
 * On native: merges styles from registry and returns style object
 *
 * Usage:
 *   const clsx = useClsx(webClasses, nativeStyles)
 *   <Div className={clsx("container", "flex")} />
 */
export function useClsx<T extends Record<string, Record<string, any>>>(
  webClasses?: Record<string, string>,
  nativeStyles?: T,
): (...args: ClassValue[]) => string | Record<string, any> {
  const styleRegistryRef = React.useRef<Map<string, Record<string, any>>>(
    new Map(),
  )
  const hasRegistered = React.useRef(false)

  // Build the style registry once on mount
  React.useEffect(() => {
    if (hasRegistered.current || (isWeb && !testNativeOnWeb)) {
      return
    }

    const registry = new Map<string, Record<string, any>>()

    // Add native styles to the registry
    if (nativeStyles) {
      Object.entries(nativeStyles).forEach(([key, styleObj]) => {
        if (styleObj && typeof styleObj === "object") {
          registry.set(key, styleObj)

          if (webClasses && webClasses[key]) {
            const webClassName = webClasses[key]
            registry.set(webClassName, styleObj)
          }
        }
      })
    }

    styleRegistryRef.current = registry
    hasRegistered.current = true
  }, [webClasses, nativeStyles])

  // Return platform-specific function
  return (...args: ClassValue[]): string | Record<string, any> => {
    if (isWeb && !testNativeOnWeb) {
      // On web (normal mode): use normal clsx
      return clsxOriginal(...args)
    }

    // On native or testing native on web: merge styles
    const classNames = flattenClasses(args)
    const mergedStyle = mergeStyles(
      classNames,
      undefined,
      styleRegistryRef.current,
    )
    return mergedStyle
  }
}

/**
 * Flatten class value array into space-separated string
 */
function flattenClasses(args: ClassValue[]): string {
  return args
    .reduce((acc: string[], val) => {
      if (typeof val === "string" || typeof val === "number") {
        acc.push(String(val))
      } else if (
        typeof val === "object" &&
        val !== null &&
        !Array.isArray(val)
      ) {
        Object.entries(val).forEach(([key, value]) => {
          if (value) {
            acc.push(key)
          }
        })
      } else if (Array.isArray(val)) {
        acc.push(...flattenClasses(val))
      }
      return acc
    }, [])
    .filter(Boolean)
    .join(" ")
}

/**
 * Static clsx for web-only usage (original clsx)
 */
export { clsxOriginal as clsx }

/**
 * Helper to combine className and style props
 */
export function useCombinedStyle<T extends Record<string, Record<string, any>>>(
  nativeStyles?: T,
): (
  className: string | undefined,
  style: Record<string, any> | undefined,
) => { className?: string; style?: Record<string, any> } {
  const registryRef = React.useRef<Map<string, Record<string, any>>>(new Map())

  React.useEffect(() => {
    if (nativeStyles) {
      const registry = new Map<string, Record<string, any>>()
      Object.entries(nativeStyles).forEach(([key, styleObj]) => {
        if (styleObj && typeof styleObj === "object") {
          registry.set(key, styleObj)
        }
      })
      registryRef.current = registry
    }
  }, [nativeStyles])

  return function combineStyle(
    className: string | undefined,
    style: Record<string, any> | undefined,
  ): { className?: string; style?: Record<string, any> } {
    if (isWeb && !testNativeOnWeb) {
      return { className, style }
    }

    const mergedStyle = mergeStyles(className, style, registryRef.current)
    return { style: mergedStyle }
  }
}

/**
 * Type-safe platform style helper
 */
export function usePlatformStyle<T extends Record<string, Record<string, any>>>(
  className?: string | Record<string, any>,
  inlineStyle?: Record<string, any>,
  nativeStyles?: T,
): { className?: string; style?: Record<string, any> } {
  if (isWeb && !testNativeOnWeb) {
    const classNameStr = typeof className === "string" ? className : undefined
    return { className: classNameStr, style: inlineStyle }
  }

  const classNameStr = typeof className === "string" ? className : undefined
  const mergedStyle = mergeStyles(classNameStr, inlineStyle, new Map())

  if (typeof className === "object" && className !== null) {
    Object.assign(mergedStyle, className)
  }

  return { style: mergedStyle }
}

/**
 * Create a static style registry
 */
export function createStyleRegistry<
  T extends Record<string, Record<string, any>>,
>(webClasses?: Record<string, string>, nativeStyles?: T) {
  const registry = new Map<string, Record<string, any>>()

  if (nativeStyles) {
    Object.entries(nativeStyles).forEach(([key, styleObj]) => {
      if (styleObj && typeof styleObj === "object") {
        registry.set(key, styleObj)

        if (webClasses && webClasses[key]) {
          const webClassName = webClasses[key]
          registry.set(webClassName, styleObj)
        }
      }
    })
  }

  return {
    clsx: (...args: ClassValue[]): string | Record<string, any> => {
      if (isWeb && !testNativeOnWeb) {
        return clsxOriginal(...args)
      }

      const classNames = flattenClasses(args)
      return mergeStyles(classNames, undefined, registry)
    },
  }
}

/**
 * Merge styles from className and inline style
 */
function mergeStyles(
  className: string | undefined,
  style: Record<string, any> | undefined,
  registry: Map<string, Record<string, any>>,
): Record<string, any> {
  const merged: Record<string, any> = { ...style }

  if (className) {
    const classes = className.split(" ").filter(Boolean)
    classes.forEach((cls) => {
      const styleObj = registry.get(cls.trim())
      if (styleObj) {
        Object.assign(merged, styleObj)
      }
    })
  }

  return merged
}
