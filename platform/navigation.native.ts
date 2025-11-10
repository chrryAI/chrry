/**
 * Native Navigation (React Native with Solito)
 */

import { useCallback, useMemo } from "react"

export interface NavigationParams {
  searchParams: URLSearchParams
  pathname: string
  push: (path: string) => void
  replace: (path: string) => void
  back: () => void
  forward: () => void
  addParams: (params: Record<string, string | number | boolean>) => void
  removeParams: (keys: string | string[]) => void
  setParams: (params: Record<string, string | number | boolean>) => void
}

let solitoRouter: any

try {
  const solito = require("solito/router")
  solitoRouter = solito.useRouter
} catch (error) {
  console.warn("[chrry/platform/navigation] Solito not found. Using fallback.")
}

/**
 * Native navigation hook using Solito
 */
export function useNavigation(): NavigationParams {
  let router: any
  let pathname = "/"
  let searchParams = new URLSearchParams()

  if (solitoRouter) {
    try {
      router = solitoRouter()
      const routerPathname = router?.pathname || "/"
      pathname = routerPathname

      // Extract search params from pathname if present
      if (routerPathname.includes("?")) {
        const [path, query] = routerPathname.split("?")
        pathname = path || "/"
        searchParams = new URLSearchParams(query || "")
      }
    } catch (error) {
      console.warn("Error using Solito router:", error)
    }
  }

  const push = useCallback(
    (path: string) => {
      if (router?.push) {
        router.push(path)
      } else {
        console.warn("Navigation not available")
      }
    },
    [router],
  )

  const replace = useCallback(
    (path: string) => {
      if (router?.replace) {
        router.replace(path)
      } else {
        console.warn("Navigation not available")
      }
    },
    [router],
  )

  const back = useCallback(() => {
    if (router?.back) {
      router.back()
    } else {
      console.warn("Navigation not available")
    }
  }, [router])

  const forward = useCallback(() => {
    // Solito doesn't have forward, just log warning
    console.warn("Forward navigation not supported on native")
  }, [])

  const addParams = useCallback(
    (params: Record<string, string | number | boolean>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      Object.entries(params).forEach(([key, value]) => {
        newSearchParams.set(key, String(value))
      })
      push(`${pathname}?${newSearchParams.toString()}`)
    },
    [pathname, searchParams, push],
  )

  const removeParams = useCallback(
    (keys: string | string[]) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      const keysArray = Array.isArray(keys) ? keys : [keys]
      keysArray.forEach((key) => newSearchParams.delete(key))
      push(`${pathname}?${newSearchParams.toString()}`)
    },
    [pathname, searchParams, push],
  )

  const setParams = useCallback(
    (params: Record<string, string | number | boolean>) => {
      const newSearchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        newSearchParams.set(key, String(value))
      })
      push(`${pathname}?${newSearchParams.toString()}`)
    },
    [pathname, push],
  )

  return useMemo(
    () => ({
      searchParams,
      pathname,
      push,
      replace,
      back,
      forward,
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
  if (solitoRouter) {
    try {
      const router = solitoRouter()
      return router?.pathname || "/"
    } catch (error) {
      return "/"
    }
  }
  return "/"
}

/**
 * Get search params (native)
 */
export function useCurrentSearchParams(): URLSearchParams {
  if (solitoRouter) {
    try {
      const router = solitoRouter()
      const pathname = router?.pathname || "/"

      if (pathname.includes("?")) {
        const [, query] = pathname.split("?")
        return new URLSearchParams(query)
      }
    } catch (error) {
      return new URLSearchParams()
    }
  }
  return new URLSearchParams()
}
