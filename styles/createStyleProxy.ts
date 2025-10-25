/**
 * Create a style proxy with caching and theme resolution
 * Reusable across all generated style hooks
 */

import React from "react"
import type { Theme } from "./theme"
import { resolveThemeValue } from "./resolveThemeValue"
import { getResponsiveValue, isResponsiveValue } from "./breakpoints"

interface StyleProxyOptions {
  styles: Record<string, Record<string, any>>
  theme: Theme
  dimensions: { width: number; height: number }
  styleCache: React.MutableRefObject<Map<string, Record<string, any>>>
}

export function createStyleProxy<T extends Record<string, any>>(
  options: StyleProxyOptions,
): T {
  const { styles, theme, dimensions, styleCache } = options

  return new Proxy({} as T, {
    get(_target: any, prop: string | symbol): any {
      if (typeof prop === "symbol") return undefined

      const className = prop as string

      // Check cache first
      const cacheKey = `${className}-${dimensions.width}`
      if (styleCache.current.has(cacheKey)) {
        return { style: styleCache.current.get(cacheKey)! }
      }

      // Start with base styles
      const baseStyle = styles[className] || {}
      const responsiveStyle: Record<string, any> = {}

      // Resolve theme values and handle responsive properties
      for (const [key, value] of Object.entries(baseStyle)) {
        let resolvedValue = value

        // Handle responsive breakpoint values
        if (isResponsiveValue(value)) {
          resolvedValue = getResponsiveValue(dimensions.width, value)
        }

        // Resolve theme variables
        resolvedValue = resolveThemeValue(resolvedValue, theme)

        // Handle responsive font sizes (clamp-like behavior)
        if (
          key === "fontSize" &&
          typeof resolvedValue === "string" &&
          resolvedValue.includes("vw")
        ) {
          const vwValue = parseFloat(resolvedValue)
          const calculatedSize = (dimensions.width * vwValue) / 100
          // Clamp between min and max (1.2rem = 19.2px, 1.625rem = 26px)
          resolvedValue = Math.max(19, Math.min(26, calculatedSize))
        }

        responsiveStyle[key] = resolvedValue
      }

      // Cache the resolved style
      styleCache.current.set(cacheKey, responsiveStyle)

      // Return inline styles + className for both web and native
      return {
        style: responsiveStyle,
        className: className, // Include className for CSS modules
      }
    },
  })
}
