/**
 * Native Navigation (React Native with Solito)
 */

import React, { createContext, useCallback, useMemo } from "react"
import { useCustomNavigation } from "./CustomNavigator.native"

export interface NavigationOptions {
  scroll?: boolean
  shallow?: boolean
  clientOnly?: boolean
}

export interface NavigationParams {
  searchParams: URLSearchParams
  pathname: string
  push: (path: string, options?: NavigationOptions) => void
  replace: (path: string, options?: NavigationOptions) => void
  back: () => void
  forward: () => void
  refresh: () => void
  prefetch: (path: string) => void
  addParams: (params: Record<string, string | number | boolean>) => void
  removeParams: (keys: string | string[]) => void
  setParams: (params: Record<string, string | number | boolean>) => void
}

// Context to hold the current route info
const NativeRouteContext = createContext<{
  pathname: string
  searchParams: URLSearchParams
}>({
  pathname: "/",
  searchParams: new URLSearchParams(),
})

export const NativeRouteProvider = ({
  children,
  state,
}: {
  children: React.ReactNode
  state: any
}) => {
  const value = useMemo(() => {
    if (!state) {
      return {
        pathname: "/",
        searchParams: new URLSearchParams(),
      }
    }

    const currentRoute = state.routes[state.index]

    let pathname = "/"
    if (currentRoute) {
      if (currentRoute.name === "home") pathname = "/"
      else if (currentRoute.name === "thread")
        pathname = `/threads/${currentRoute.params?.id || ""}`
      else pathname = `/${currentRoute.name}`
    }

    const searchParams = new URLSearchParams()
    if (currentRoute?.params) {
      Object.entries(currentRoute.params).forEach(([key, value]) => {
        if (key !== "id") searchParams.set(key, String(value))
      })
    }

    return { pathname, searchParams }
  }, [state])

  return React.createElement(NativeRouteContext.Provider, { value }, children)
}

// Helper to parse path into route name and params
const parsePath = (path: string) => {
  const cleanPath = path.split("?")[0] || ""
  const query = path.split("?")[1] || ""
  const searchParams = new URLSearchParams(query)
  const params: Record<string, any> = Object.fromEntries(searchParams.entries())

  if (cleanPath === "/" || cleanPath === "") {
    return { name: "home", params }
  }
  if (cleanPath.startsWith("/threads/")) {
    const id = cleanPath.split("/")[2]
    return { name: "thread", params: { ...params, id } }
  }
  if (cleanPath === "/threads") {
    return { name: "threads", params }
  }
  // Fallback for other routes - try to use the path segment as route name
  const segment = cleanPath.slice(1)
  return { name: segment, params }
}

/**
 * Native navigation hook using Custom Navigator
 */
export function useNavigation(): NavigationParams {
  // Get custom navigation
  let customNav: any = null
  try {
    customNav = useCustomNavigation()
  } catch (_e) {
    // Not inside a navigator
  }

  const route = customNav?.currentRoute

  // Build pathname from route
  const pathname = useMemo(() => {
    if (!route) return "/"
    if (route.name === "home") return "/"
    if (route.name === "thread") return `/threads/${route.params?.id || ""}`
    return `/${route.name}`
  }, [route])

  // Build searchParams from route params
  const searchParams = useMemo(() => {
    const params = new URLSearchParams()
    if (route?.params) {
      Object.entries(route.params).forEach(([key, value]) => {
        if (key !== "id") params.set(key, String(value))
      })
    }
    return params
  }, [route])

  const push = useCallback(
    (path: string, options?: NavigationOptions) => {
      if (!customNav) return
      const { name, params } = parsePath(path)
      customNav.navigate(name, params)
    },
    [customNav],
  )

  const replace = useCallback(
    (path: string, options?: NavigationOptions) => {
      if (!customNav) return
      const { name, params } = parsePath(path)
      customNav.navigate(name, params)
    },
    [customNav],
  )

  const back = useCallback(() => {
    if (customNav?.canGoBack()) {
      customNav.goBack()
    }
  }, [customNav])

  const forward = useCallback(() => {
    console.warn("Forward navigation not supported on native")
  }, [])

  const refresh = useCallback(() => {
    // No-op
  }, [])

  const prefetch = useCallback((path: string) => {
    // No-op
  }, [])

  const addParams = useCallback(
    (params: Record<string, string | number | boolean>) => {
      if (!customNav) return
      const { name } = customNav.currentRoute
      customNav.navigate(name, { ...customNav.currentRoute.params, ...params })
    },
    [customNav],
  )

  const removeParams = useCallback(
    (keys: string | string[]) => {
      if (!customNav) return
      const keysArray = Array.isArray(keys) ? keys : [keys]
      const { name, params = {} } = customNav.currentRoute
      const newParams = { ...params }
      keysArray.forEach((key) => {
        delete newParams[key]
      })
      customNav.navigate(name, newParams)
    },
    [customNav],
  )

  const setParams = useCallback(
    (params: Record<string, string | number | boolean>) => {
      if (!customNav) return
      const { name } = customNav.currentRoute
      customNav.navigate(name, params)
    },
    [customNav],
  )

  return useMemo(
    () => ({
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
 * Get current pathname (native)
 */
export function useCurrentPathname(): string {
  const { pathname } = useNavigation()
  return pathname
}

/**
 * Get search params (native)
 */
export function useCurrentSearchParams(): URLSearchParams {
  const { searchParams } = useNavigation()
  return searchParams
}

/**
 * Get previous pathname (native)
 */
export function usePreviousPathname(): string | null {
  // TODO: Implement actual history tracking if needed
  return null
}
