/**
 * Platform-aware Styling Hook
 * Automatically applies correct styles based on platform
 */

import { useMemo } from "react"
import { usePlatform } from "./PlatformProvider"

// ============================================
// STYLE TYPES
// ============================================

export type PlatformStyle = {
  web?: any
  native?: any
  ios?: any
  android?: any
  default?: any
}

export type PlatformStyles = {
  [key: string]: PlatformStyle | any
}

// ============================================
// PLATFORM STYLES HOOK
// ============================================

/**
 * Select the correct style based on platform
 *
 * @example
 * const styles = usePlatformStyles({
 *   container: {
 *     web: { cursor: 'pointer' },
 *     native: { elevation: 2 },
 *     default: { padding: 16 }
 *   }
 * })
 */
export function usePlatformStyles<T extends PlatformStyles>(styles: T) {
  const { platform, isWeb, isNative, isIOS, isAndroid } = usePlatform()

  return useMemo(() => {
    const resolved: any = {}

    for (const [key, value] of Object.entries(styles)) {
      // If value has platform-specific keys
      if (
        value &&
        typeof value === "object" &&
        ("web" in value ||
          "native" in value ||
          "ios" in value ||
          "android" in value)
      ) {
        // Priority: ios/android > native > web > default
        if (isIOS && value.ios) {
          resolved[key] = { ...value.default, ...value.ios }
        } else if (isAndroid && value.android) {
          resolved[key] = { ...value.default, ...value.android }
        } else if (isNative && value.native) {
          resolved[key] = { ...value.default, ...value.native }
        } else if (isWeb && value.web) {
          resolved[key] = { ...value.default, ...value.web }
        } else {
          resolved[key] = value.default || value
        }
      } else {
        // No platform-specific keys, use as-is
        resolved[key] = value
      }
    }

    return resolved
  }, [styles, platform, isWeb, isNative, isIOS, isAndroid])
}

// ============================================
// SCSS TO PLATFORM STYLES
// ============================================

/**
 * Convert SCSS-generated styles to platform-aware styles
 * Automatically handles web-only properties
 *
 * @example
 * const styles = useAdaptiveStyles(ThreadStyles, {
 *   container: {
 *     native: { elevation: 2 }
 *   }
 * })
 */
export function useAdaptiveStyles<T extends Record<string, any>>(
  baseStyles: T,
  platformOverrides?: Partial<Record<keyof T, PlatformStyle>>,
) {
  const { isWeb } = usePlatform()

  return useMemo(() => {
    const adapted: any = {}

    for (const [key, value] of Object.entries(baseStyles)) {
      const override = platformOverrides?.[key as keyof T]

      if (override) {
        // Has platform-specific overrides
        adapted[key] = {
          ...value,
          ...(override as any),
        }
      } else {
        // Filter out web-only properties on native
        if (!isWeb && value && typeof value === "object") {
          const filtered = { ...value }

          // Remove web-only CSS properties
          const webOnlyProps = [
            "cursor",
            "userSelect",
            "WebkitOverflowScrolling",
            "scrollbarWidth",
            "boxShadow",
            "textDecoration",
            "outline",
            "transition",
            "animation",
            "transform", // Handled differently on native
          ]

          webOnlyProps.forEach((prop) => {
            delete filtered[prop]
          })

          adapted[key] = filtered
        } else {
          adapted[key] = value
        }
      }
    }

    return adapted
  }, [baseStyles, platformOverrides, isWeb])
}

// ============================================
// RESPONSIVE STYLES
// ============================================

/**
 * Create responsive styles based on screen size
 *
 * @example
 * const styles = useResponsiveStyles({
 *   container: {
 *     base: { padding: 8 },
 *     sm: { padding: 12 },
 *     md: { padding: 16 },
 *     lg: { padding: 24 }
 *   }
 * })
 */
export function useResponsiveStyles<T extends Record<string, any>>(
  responsiveStyles: T,
) {
  const { isMobile, isTablet, isDesktop } = usePlatform()

  return useMemo(() => {
    const resolved: any = {}

    for (const [key, value] of Object.entries(responsiveStyles)) {
      if (value && typeof value === "object") {
        const { base, sm, md, lg, xl } = value

        // Build style based on breakpoint
        let style = base || {}

        if (isMobile && sm) {
          style = { ...style, ...sm }
        }

        if (isTablet && md) {
          style = { ...style, ...md }
        }

        if (isDesktop) {
          if (lg) style = { ...style, ...lg }
          if (xl) style = { ...style, ...xl }
        }

        resolved[key] = style
      } else {
        resolved[key] = value
      }
    }

    return resolved
  }, [responsiveStyles, isMobile, isTablet, isDesktop])
}

// ============================================
// STYLE UTILITIES
// ============================================

/**
 * Merge multiple style objects
 */
export function mergeStyles(...styles: any[]) {
  return styles.reduce((acc, style) => {
    if (!style) return acc
    if (Array.isArray(style)) {
      return { ...acc, ...mergeStyles(...style) }
    }
    return { ...acc, ...style }
  }, {})
}

/**
 * Conditionally apply styles
 */
export function conditionalStyle(condition: boolean, style: any) {
  return condition ? style : {}
}

/**
 * Create platform styles (identity function - Tamagui handles optimization)
 * Kept for API compatibility
 */
export function createPlatformStyles<T extends Record<string, any>>(
  styles: T,
): T {
  // Tamagui handles style optimization internally
  return styles
}
