/**
 * Web Navigation (Next.js + Extension fallback)
 */

import React, { useCallback, useMemo, useEffect, useRef } from "react"
import {
  useRouter as useClientRouter,
  usePathname as useClientPathname,
  useSearchParams as useClientSearchParams,
} from "../hooks/useWindowHistory"

// Try to import Next.js hooks, but don't fail if they're not available
let useNextRouter: any
let useNextPathname: any
let useNextSearchParams: any

try {
  const nextNavigation = require("next/navigation")
  useNextRouter = nextNavigation.useRouter
  useNextPathname = nextNavigation.usePathname
  useNextSearchParams = nextNavigation.useSearchParams
} catch {
  // Next.js not available - will use client router
}

export interface NavigationOptions {
  scroll?: boolean // Scroll to top after navigation (default: true)
  shallow?: boolean // Update URL without re-fetching data (default: false)
  clientOnly?: boolean // Use pure client-side navigation (no server round-trip, SPA-style)
}

export interface NavigationParams {
  searchParams: URLSearchParams
  pathname: string
  push: (path: string, options?: NavigationOptions) => void
  replace: (path: string, options?: NavigationOptions) => void
  back: () => void
  forward: () => void
  refresh: () => void // Force refresh current route
  prefetch: (path: string) => void // Prefetch route for instant navigation
  addParams: (params: Record<string, string | number | boolean>) => void
  removeParams: (keys: string | string[]) => void
  setParams: (params: Record<string, string | number | boolean>) => void
}

// Detect if we're in a Next.js environment
const isNextJsEnvironment = () => {
  if (typeof window === "undefined") return true // SSR
  // Check if Next.js router context exists
  try {
    return !!(window as any).__NEXT_DATA__
  } catch {
    return false
  }
}

/**
 * Web navigation hook using Next.js router ONLY
 * For extensions, use navigation.extension.ts instead
 */
export function useNavigation(): NavigationParams {
  // Try to use Next.js hooks if available, otherwise fall back to client router
  const nextRouter = useNextRouter?.()
  const pathname = useNextPathname?.() || useClientPathname()
  const searchParams = useNextSearchParams?.() || useClientSearchParams()

  // Get clientRouter for bulletproof client-side navigation actions
  const clientRouter = useClientRouter()

  const push = useCallback(
    (path: string, options?: NavigationOptions) => {
      // Default to clientOnly: true for blazing fast navigation! ⚡️
      const useClientOnly = options?.clientOnly !== false

      if (useClientOnly) {
        // Bulletproof client-side navigation using window.history (DEFAULT)
        clientRouter.push(path, { scroll: options?.scroll })
      } else {
        // Next.js navigation with server data fetching (opt-in with clientOnly: false)
        nextRouter?.push(path, { scroll: options?.scroll })
      }
    },
    [nextRouter, clientRouter],
  )

  const replace = useCallback(
    (path: string, options?: NavigationOptions) => {
      // Default to clientOnly: true for blazing fast navigation! ⚡️
      const useClientOnly = options?.clientOnly !== false

      if (useClientOnly) {
        // Bulletproof client-side navigation using window.history (DEFAULT)
        clientRouter.replace(path, { scroll: options?.scroll })
      } else {
        // Next.js navigation with server data fetching (opt-in with clientOnly: false)
        nextRouter?.replace(path, { scroll: options?.scroll })
      }
    },
    [nextRouter, clientRouter],
  )

  const back = useCallback(() => {
    nextRouter?.back()
  }, [nextRouter])

  const forward = useCallback(() => {
    nextRouter?.forward()
  }, [nextRouter])

  const refresh = useCallback(() => {
    nextRouter?.refresh()
  }, [nextRouter])

  const prefetch = useCallback(
    (path: string) => {
      nextRouter?.prefetch(path)
    },
    [nextRouter],
  )

  const addParams = useCallback(
    (params: Record<string, string | number | boolean>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString())
      Object.entries(params).forEach(([key, value]) => {
        newSearchParams.set(key, String(value))
      })
      const queryString = newSearchParams.toString()
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname

      // Use clientRouter if nextRouter is not available (Vite/non-Next.js)
      if (nextRouter) {
        nextRouter.push(newUrl)
      } else {
        clientRouter.push(newUrl)
      }
    },
    [nextRouter, clientRouter, pathname, searchParams],
  )

  const removeParams = useCallback(
    (keys: string | string[]) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString())
      const keysArray = Array.isArray(keys) ? keys : [keys]
      keysArray.forEach((key) => newSearchParams.delete(key))
      const queryString = newSearchParams.toString()
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname

      // Use clientRouter if nextRouter is not available (Vite/non-Next.js)
      if (nextRouter) {
        nextRouter.push(newUrl)
      } else {
        clientRouter.push(newUrl)
      }
    },
    [nextRouter, clientRouter, pathname, searchParams],
  )

  const setParams = useCallback(
    (params: Record<string, string | number | boolean>) => {
      const newSearchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        newSearchParams.set(key, String(value))
      })
      const queryString = newSearchParams.toString()
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname

      // Use clientRouter if nextRouter is not available (Vite/non-Next.js)
      if (nextRouter) {
        nextRouter.push(newUrl)
      } else {
        clientRouter.push(newUrl)
      }
    },
    [nextRouter, clientRouter, pathname],
  )

  return useMemo(
    () => ({
      searchParams: searchParams || new URLSearchParams(),
      pathname: pathname || "/",
      push,
      replace,
      back,
      forward,
      refresh,
      prefetch,
      addParams,
      removeParams,
      setParams,
    }),
    [
      searchParams,
      pathname,
      push,
      replace,
      back,
      forward,
      refresh,
      prefetch,
      addParams,
      removeParams,
      setParams,
    ],
  )
}

/**
 * Get current pathname (web)
 */
export function useCurrentPathname(): string {
  const pathname = useNextPathname?.() || useClientPathname()
  return pathname || "/"
}

/**
 * Get search params (web)
 */
export function useCurrentSearchParams(): URLSearchParams {
  const searchParams = useNextSearchParams?.() || useClientSearchParams()
  return searchParams || new URLSearchParams()
}

/**
 * Get previous pathname (web)
 */
export function usePreviousPathname(): string | null {
  // TODO: Implement actual history tracking if needed
  return null
}

export const NativeRouteProvider = ({
  children,
}: {
  children: React.ReactNode
  state?: any
}) => React.createElement(React.Fragment, null, children)
