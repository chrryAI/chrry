import { useCallback, useMemo, useRef, useEffect } from "react"
import {
  clientRouter,
  usePathname,
  useSearchParams,
} from "../hooks/useWindowHistory"

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

/**
 * Extension navigation hook using ClientRouter only
 */
export function useNavigation(): NavigationParams {
  const router = clientRouter
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const push = useCallback(
    (path: string) => {
      router?.push(path)
    },
    [router],
  )

  const replace = useCallback(
    (path: string) => {
      router?.replace(path)
    },
    [router],
  )

  const back = useCallback(() => {
    router?.back()
  }, [router])

  const forward = useCallback(() => {
    router?.forward()
  }, [router])

  const addParams = useCallback(
    (params: Record<string, string | number | boolean>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString())
      Object.entries(params).forEach(([key, value]) => {
        newSearchParams.set(key, String(value))
      })
      const newUrl = `${pathname}?${newSearchParams.toString()}`
      router?.push(newUrl)
    },
    [router, pathname, searchParams],
  )

  const removeParams = useCallback(
    (keys: string | string[]) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString())
      const keysArray = Array.isArray(keys) ? keys : [keys]
      keysArray.forEach((key) => newSearchParams.delete(key))
      const newUrl = `${pathname}?${newSearchParams.toString()}`
      router?.push(newUrl)
    },
    [router, pathname, searchParams],
  )

  const setParams = useCallback(
    (params: Record<string, string | number | boolean>) => {
      const newSearchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        newSearchParams.set(key, String(value))
      })
      const newUrl = `${pathname}?${newSearchParams.toString()}`
      router?.push(newUrl)
    },
    [router, pathname],
  )

  return useMemo(
    () => ({
      searchParams: searchParams || new URLSearchParams(),
      pathname: pathname || "/",
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
 * Get current pathname (extension)
 */
export function useCurrentPathname(): string {
  const pathname = usePathname()
  return pathname || "/"
}

/**
 * Get search params (extension)
 */
export function useCurrentSearchParams(): URLSearchParams {
  const searchParams = useSearchParams()
  return searchParams || new URLSearchParams()
}

/**
 * Get previous pathname (extension)
 */
export function usePreviousPathname(): string | null {
  const pathname = usePathname()
  const previousPathnameRef = useRef<string | null>(null)
  const currentPathnameRef = useRef<string | null>(null)

  useEffect(() => {
    // On first run, just set current
    if (currentPathnameRef.current === null) {
      currentPathnameRef.current = pathname
      return
    }

    // If pathname changed, update previous
    if (currentPathnameRef.current !== pathname) {
      previousPathnameRef.current = currentPathnameRef.current
      currentPathnameRef.current = pathname
    }
  }, [pathname])

  return previousPathnameRef.current
}
