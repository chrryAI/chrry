/**
 * Web Navigation (Next.js + Extension fallback)
 */

import React, { useCallback, useMemo } from "react"
import {
  useRouter as useClientRouter,
  usePathname as useClientPathname,
  useSearchParams as useClientSearchParams,
  RouterState,
} from "../hooks/useWindowHistory"

// No longer using Next.js - fully migrated to Vite
// All navigation now uses client-side router from useWindowHistory

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
// No longer needed - fully migrated to Vite
// Keeping function for backwards compatibility but always returns false
const isNextJsEnvironment = () => false

/**
 * Web navigation hook using client-side router (Vite)
 * For extensions, use navigation.extension.ts instead
 */
export function useNavigation(): NavigationParams {
  // Use client router for all navigation (Vite migration complete)
  const pathname = useClientPathname()
  const searchParams = useClientSearchParams()
  const clientRouter = useClientRouter()

  const push = useCallback(
    (path: string, options?: NavigationOptions) => {
      // Client-side navigation using window.history
      clientRouter.push(path, { scroll: options?.scroll })
    },
    [clientRouter],
  )

  const replace = useCallback(
    (path: string, options?: NavigationOptions) => {
      // Client-side navigation using window.history
      clientRouter.replace(path, { scroll: options?.scroll })
    },
    [clientRouter],
  )

  const back = useCallback(() => {
    clientRouter.back()
  }, [clientRouter])

  const forward = useCallback(() => {
    clientRouter.forward()
  }, [clientRouter])

  const refresh = useCallback(() => {
    window.location.reload()
  }, [])

  const prefetch = useCallback((path: string) => {
    // No-op for now - could implement link prefetching later
  }, [])

  const addParams = useCallback(
    (params: Record<string, string | number | boolean>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString())
      Object.entries(params).forEach(([key, value]) => {
        newSearchParams.set(key, String(value))
      })
      const queryString = newSearchParams.toString()
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname

      // Use client router for all navigation (shallow to skip view transitions)
      clientRouter.push(newUrl, { shallow: true })
    },
    [clientRouter, pathname, searchParams],
  )

  const removeParams = useCallback(
    (keys: string | string[]) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString())
      const keysArray = Array.isArray(keys) ? keys : [keys]

      // Check if any of the keys actually exist
      const hasAnyKey = keysArray.some((key) => newSearchParams.has(key))

      if (!hasAnyKey) {
        // No params to remove, skip navigation
        return
      }

      keysArray.forEach((key) => newSearchParams.delete(key))
      const queryString = newSearchParams.toString()
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname

      // Use client router for all navigation (shallow to skip view transitions)
      clientRouter.push(newUrl, { shallow: true })
    },
    [clientRouter, pathname, searchParams],
  )

  const setParams = useCallback(
    (params: Record<string, string | number | boolean>) => {
      const newSearchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        newSearchParams.set(key, String(value))
      })
      const queryString = newSearchParams.toString()
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname

      // Use client router for all navigation (shallow to skip view transitions)
      clientRouter.push(newUrl, { shallow: true })
    },
    [clientRouter, pathname],
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
  const pathname = useClientPathname()
  return pathname || "/"
}

/**
 * Get search params (web)
 */
export function useCurrentSearchParams(): URLSearchParams {
  const searchParams = useClientSearchParams()
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
