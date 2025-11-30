"use client"

import { useEffect, useState } from "react"

// Types
export interface NavigateOptions {
  scroll?: boolean
  shallow?: boolean
  replace?: boolean // Use replaceState instead of pushState
}

export interface RouterState {
  pathname: string
  searchParams: URLSearchParams
  hash: string
}

// SSR hydration state
declare global {
  interface Window {
    __ROUTER_STATE__?: RouterState
  }
}

class ClientRouter {
  private listeners: Set<() => void> = new Set()
  private state: RouterState
  private isProgrammaticNavigation = false
  private supportsViewTransitions: boolean
  private lastNavigationTime = 0
  private navigationDebounceMs = 10 // Prevent double-tap navigation
  private isSwipeNavigation = false // Track mobile swipe gestures

  constructor() {
    // SSR hydration: Use server state if available
    this.state =
      typeof window !== "undefined" && window.__ROUTER_STATE__
        ? window.__ROUTER_STATE__
        : this.getCurrentState()

    // Cache View Transitions API support check
    this.supportsViewTransitions =
      typeof document !== "undefined" && "startViewTransition" in document

    // Log support status for debugging
    if (typeof window !== "undefined") {
      console.log(
        "🎬 View Transitions supported:",
        this.supportsViewTransitions,
      )
    }

    if (typeof window === "undefined") return

    // Listen to browser navigation events (passive for better performance)
    window.addEventListener("popstate", this.handlePopState, { passive: true })
    window.addEventListener("hashchange", this.handleHashChange, {
      passive: true,
    })

    // Detect mobile swipe gestures for back/forward navigation
    this.setupSwipeDetection()
  }

  private getCurrentState(): RouterState {
    if (typeof window === "undefined") {
      return {
        pathname: "",
        searchParams: new URLSearchParams(),
        hash: "",
      }
    }
    const url = new URL(window.location.href)
    const pathname = url.pathname === "/index.html" ? "/" : url.pathname || "/"

    return {
      pathname,
      searchParams: url.searchParams,
      hash: url.hash,
    }
  }

  private handlePopState = () => {
    // Ignore popstate during programmatic navigation
    if (this.isProgrammaticNavigation) {
      return
    }

    // Native browser back/forward (mobile swipe gestures, browser buttons)
    // Don't use view transitions - let browser handle it natively for smooth UX
    console.log("🎬 Native back/forward navigation (no view transition)")
    this.state = this.getCurrentState()
    this.notifyListeners()
  }

  private handleHashChange = () => {
    this.state = this.getCurrentState()
    this.notifyListeners()
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener())
  }

  private setupSwipeDetection() {
    if (typeof window === "undefined") return

    let touchStartX = 0
    let touchStartY = 0

    window.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches[0]) {
          touchStartX = e.touches[0].clientX
          touchStartY = e.touches[0].clientY
        }
      },
      { passive: true },
    )

    window.addEventListener(
      "touchmove",
      (e) => {
        if (!e.touches[0]) return

        const touchEndX = e.touches[0].clientX
        const touchEndY = e.touches[0].clientY

        const deltaX = touchEndX - touchStartX
        const deltaY = touchEndY - touchStartY

        // Detect horizontal swipe from screen edge (back/forward gesture)
        // iOS Safari: swipe from left edge = back, right edge = forward
        const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY)
        const isFromEdge =
          touchStartX < 50 || touchStartX > window.innerWidth - 50

        if (isHorizontalSwipe && isFromEdge && Math.abs(deltaX) > 10) {
          this.isSwipeNavigation = true
          console.log("🎬 Swipe gesture detected - disabling view transitions")
        }
      },
      { passive: true },
    )

    window.addEventListener(
      "touchend",
      () => {
        // Reset swipe flag after a delay
        setTimeout(() => {
          this.isSwipeNavigation = false
        }, 500)
      },
      { passive: true },
    )
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  push(href: string, options: NavigateOptions = {}) {
    if (typeof window === "undefined") return

    // Debounce: Prevent double navigation (mobile double-tap)
    const now = Date.now()
    if (now - this.lastNavigationTime < this.navigationDebounceMs) {
      console.log("⚡️ Navigation debounced (double-tap prevented)")
      return
    }
    this.lastNavigationTime = now

    this.isProgrammaticNavigation = true
    const url = new URL(href, window.location.origin)

    const performNavigation = () => {
      // Support both push and replace
      if (options.replace) {
        window.history.replaceState({}, "", url.toString())
      } else {
        window.history.pushState({}, "", url.toString())
      }

      this.state = this.getCurrentState()

      if (options.scroll !== false) {
        window.scrollTo(0, 0)
      }

      this.notifyListeners()

      // Use queueMicrotask for better performance than setTimeout
      queueMicrotask(() => {
        this.isProgrammaticNavigation = false
      })
    }

    // Use cached View Transitions API check
    // Skip transitions during swipe gestures to avoid conflicts with native animations
    if (
      this.supportsViewTransitions &&
      !options.shallow &&
      !this.isSwipeNavigation
    ) {
      console.log("🎬 Using View Transition for navigation to:", href)
      document.startViewTransition(performNavigation)
    } else {
      if (this.isSwipeNavigation) {
        console.log("🎬 Swipe navigation - skipping view transition")
      }
      performNavigation()
    }
  }

  replace(href: string, options: NavigateOptions = {}) {
    // Delegate to push with replace option
    this.push(href, { ...options, replace: true })
  }

  /**
   * Prefetch a route to warm up the cache
   * Useful for hover/focus prefetching
   */
  prefetch(url: string) {
    if (typeof window === "undefined") return

    try {
      // HEAD request to warm up cache without downloading full content
      fetch(url, { method: "HEAD", mode: "no-cors" }).catch(() => {
        // Silently fail - prefetch is a hint, not critical
      })
    } catch {
      // Ignore prefetch errors
    }
  }

  /**
   * Get current router state (useful for SSR hydration)
   */
  getState(): RouterState {
    return this.state
  }

  refresh() {
    if (typeof window === "undefined") return
    // Force refresh by updating state and notifying listeners
    this.state = this.getCurrentState()
    this.notifyListeners()
    // Scroll to top on refresh
    window.scrollTo(0, 0)
  }

  back() {
    if (typeof window === "undefined") return
    window.history.back()
  }

  forward() {
    if (typeof window === "undefined") return
    window.history.forward()
  }

  destroy() {
    if (typeof window === "undefined") return
    window.removeEventListener("popstate", this.handlePopState)
    window.removeEventListener("hashchange", this.handleHashChange)
    this.listeners.clear()
  }

  // Get cached View Transitions support status
  hasViewTransitions() {
    return this.supportsViewTransitions
  }
}

// Create singleton instance
export const clientRouter = new ClientRouter()

export function useRouter() {
  return {
    push: clientRouter.push.bind(clientRouter),
    replace: clientRouter.replace.bind(clientRouter),
    back: clientRouter.back.bind(clientRouter),
    forward: clientRouter.forward.bind(clientRouter),
    refresh: clientRouter.refresh.bind(clientRouter),
  }
}

export function usePathname() {
  const [pathname, setPathname] = useState(clientRouter.getState().pathname)

  useEffect(() => {
    const unsubscribe = clientRouter.subscribe(() => {
      setPathname(clientRouter.getState().pathname)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return pathname
}

export function useSearchParams() {
  const [searchParams, setSearchParams] = useState(
    clientRouter.getState().searchParams,
  )

  useEffect(() => {
    const unsubscribe = clientRouter.subscribe(() => {
      setSearchParams(clientRouter.getState().searchParams)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return searchParams
}

export function useWindowHistory() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return {
    router,
    pathname,
    searchParams,
  }
}
