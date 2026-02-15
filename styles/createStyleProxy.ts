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
  isWeb?: boolean
}

export function createStyleProxy<T extends Record<string, any>>(
  options: StyleProxyOptions,
): T {
  const { styles, theme, dimensions, styleCache, isWeb = true } = options

  // Safety check: ensure styles object exists
  if (!styles || typeof styles !== "object") {
    console.warn("createStyleProxy: styles object is undefined or invalid")
    return new Proxy({} as T, {
      get() {
        return { style: {}, className: "" }
      },
    })
  }

  return new Proxy({} as T, {
    get(_target: any, prop: string | symbol): any {
      if (typeof prop === "symbol") return undefined

      const className = prop as string

      // Check cache first
      const cacheKey = `${className}-${dimensions.width}`
      if (styleCache.current.has(cacheKey)) {
        return { style: styleCache.current.get(cacheKey)! }
      }

      // Start with base styles - add safety check
      const baseStyle = styles?.[className] || {}
      const responsiveStyle: Record<string, any> = {}

      // Resolve theme values and handle responsive properties
      for (const [key, value] of Object.entries(baseStyle)) {
        let resolvedValue = value

        // Handle responsive breakpoint values
        if (isResponsiveValue(value)) {
          resolvedValue = getResponsiveValue(dimensions.width, value)
        }

        // Only resolve theme variables for native platforms
        // For web, keep CSS variables as-is so the browser can handle them dynamically
        if (!isWeb) {
          resolvedValue = resolveThemeValue(resolvedValue, theme)

          // React Native compatibility fixes - only if resolvedValue is still a string
          if (
            resolvedValue !== undefined &&
            resolvedValue !== null &&
            typeof resolvedValue === "string"
          ) {
            // Convert position: fixed to absolute (RN doesn't support fixed)
            if (key === "position" && resolvedValue === "fixed") {
              resolvedValue = "absolute"
            }

            // Convert viewport units (100dvh, 100vw, etc.) to dimensions
            if (
              resolvedValue?.includes?.("dvh") ||
              resolvedValue?.includes?.("vh")
            ) {
              const match = resolvedValue.match(/(\d+(?:\.\d+)?)(dvh|vh)/)
              if (match) {
                const percentage = parseFloat(match[1])
                resolvedValue = (dimensions.height * percentage) / 100
              }
            }
            if (resolvedValue?.includes?.("vw")) {
              const match = resolvedValue.match(/(\d+(?:\.\d+)?)vw/)
              if (match) {
                const percentage = parseFloat(match[1])
                resolvedValue = (dimensions.width * percentage) / 100
              }
            }

            // Convert overflowY/overflowX to overflow (RN uses single overflow prop)
            if (key === "overflowY" || key === "overflowX") {
              // Skip this key, will be handled by overflow property
              continue
            }

            // Convert percentage borderRadius to numeric value
            if (key === "borderRadius" && resolvedValue.includes?.("%")) {
              // For 50%, use a large number to create circle effect
              if (resolvedValue === "50%") {
                resolvedValue = 9999
              }
            }

            // Remove calc() expressions (not supported in RN)
            if (resolvedValue.includes?.("calc(")) {
              // Try to extract simple calculations
              const calcMatch = resolvedValue.match(/calc\((.+)\)/)
              if (calcMatch) {
                // For now, skip complex calc expressions
                // TODO: Implement calc parser if needed
                continue
              }
            }
          }
        }

        // Handle responsive font sizes (clamp-like behavior)
        if (
          key === "fontSize" &&
          typeof resolvedValue === "string" &&
          resolvedValue.includes?.("vw")
        ) {
          const vwValue = parseFloat(resolvedValue)
          const calculatedSize = (dimensions.width * vwValue) / 100
          // Clamp between min and max (1.2rem = 19.2px, 1.625rem = 26px)
          resolvedValue = Math.max(19, Math.min(26, calculatedSize))
        }

        responsiveStyle[key] = resolvedValue
      }

      // React Native: Add overflow property if overflowY or overflowX was in baseStyle
      if (!isWeb && (baseStyle.overflowY || baseStyle.overflowX)) {
        responsiveStyle.overflow =
          baseStyle.overflowY || baseStyle.overflowX || "visible"
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
