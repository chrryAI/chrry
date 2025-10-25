/**
 * Create a reusable style hook with responsive behavior and caching
 * Factory function that generates hooks for any style definition
 */

import React, { startTransition } from "react"
import { usePlatform } from "../platform/PlatformProvider"
import { useTheme } from "./theme"
import { createStyleProxy } from "./createStyleProxy"

export function createStyleHook<T extends Record<string, any>>(styles: {
  native: Record<string, any>
}) {
  return function useStyles(): T {
    // Make usePlatform optional - gracefully handle missing PlatformProvider
    let platform
    try {
      platform = usePlatform()
    } catch (error) {
      // PlatformProvider not available - use defaults
      platform = null
    }
    const theme = useTheme()

    const [dimensions, setDimensions] = React.useState(() =>
      typeof window !== "undefined"
        ? { width: window.innerWidth, height: window.innerHeight }
        : { width: 1024, height: 768 },
    )

    // Debounced resize handler with startTransition to prevent Suspense triggers
    React.useEffect(() => {
      if (typeof window === "undefined") return

      let timeoutId: any
      const handleResize = () => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          // Use startTransition to make this a non-blocking update
          // This prevents Suspense boundaries from triggering
          startTransition(() => {
            setDimensions({
              width: window.innerWidth,
              height: window.innerHeight,
            })
          })
        }, 150) // Debounce 150ms
      }

      window.addEventListener("resize", handleResize, { passive: true })
      return () => {
        clearTimeout(timeoutId)
        window.removeEventListener("resize", handleResize)
      }
    }, [])

    // Cache resolved styles per className
    const styleCache = React.useRef<Map<string, Record<string, any>>>(new Map())

    // Clear cache when theme changes, but NOT on every dimension change
    // to prevent Suspense boundaries from triggering on resize
    React.useEffect(() => {
      styleCache.current.clear()
    }, [theme])

    // Return a proxy that provides clean property access with caching
    return createStyleProxy<T>({
      styles: styles.native as Record<string, any>,
      theme,
      dimensions,
      styleCache,
    })
  }
}
