/**
 * Web Navigation (Next.js + Extension fallback)
 */

import { useCallback, useMemo, useEffect, useRef } from "react"
import {
  useRouter as useNextRouter,
  usePathname as useNextPathname,
  useSearchParams as useNextSearchParams,
} from "next/navigation"
import { useRouter as useClientRouter } from "../hooks/useWindowHistory"

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
  const nextRouter = useNextRouter()
  const pathname = useNextPathname()
  const searchParams = useNextSearchParams()

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
      const newUrl = `${pathname}?${newSearchParams.toString()}`
      nextRouter?.push(newUrl)
    },
    [nextRouter, pathname, searchParams],
  )

  const removeParams = useCallback(
    (keys: string | string[]) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString())
      const keysArray = Array.isArray(keys) ? keys : [keys]
      keysArray.forEach((key) => newSearchParams.delete(key))
      const newUrl = `${pathname}?${newSearchParams.toString()}`
      nextRouter?.push(newUrl)
    },
    [nextRouter, pathname, searchParams],
  )

  const setParams = useCallback(
    (params: Record<string, string | number | boolean>) => {
      const newSearchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        newSearchParams.set(key, String(value))
      })
      const newUrl = `${pathname}?${newSearchParams.toString()}`
      nextRouter?.push(newUrl)
    },
    [nextRouter, pathname],
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
  const pathname = useNextPathname()
  return pathname || "/"
}

/**
 * Get search params (web)
 */
export function useCurrentSearchParams(): URLSearchParams {
  const searchParams = useNextSearchParams()
  return searchParams || new URLSearchParams()
}

/**
 * Get previous pathname (web)
 */
export function usePreviousPathname(): string | null {
  const pathname = useNextPathname()
  const previousPathnameRef = useRef<string | null>(null)
  const currentPathnameRef = useRef<string | null>(null)

  useEffect(() => {
    // On first run, just set current
    if (currentPathnameRef.current === null) {
      currentPathnameRef.current = pathname
      return
    }

    // On subsequent runs, store previous before updating current
    if (currentPathnameRef.current !== pathname) {
      previousPathnameRef.current = currentPathnameRef.current
      currentPathnameRef.current = pathname
    }
  }, [pathname])

  return previousPathnameRef.current
}
