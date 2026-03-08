"use client"

/**
 * Platform Provider
 * Runtime platform detection and abstraction
 *
 * Detects platform at runtime and provides context to all components
 * No need for .native.tsx or .web.tsx files!
 */

/// <reference types="chrome" />

import React, {
  createContext,
  type ReactNode,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import console from "../utils/log"
import { useCookie } from "./cookies"
import {
  detectPlatform as _detectPlatform,
  getBrowser as _getBrowser,
  isAndroid as _isAndroid,
  isBrowserExtension as _isBrowserExtension,
  isCapacitor as _isCapacitor,
  isIOS as _isIOS,
  isNative as _isNative,
  isStandalone as _isStandalone,
  isTauri as _isTauri,
  isWeb as _isWeb,
  type BrowserType,
  type PlatformType,
} from "./detection"

// Dimensions will be imported dynamically when needed

// Re-export for backwards compatibility
export type { PlatformType, BrowserType }
export {
  detectPlatform,
  getBrowser,
  isAndroid,
  isBrowserExtension,
  isCapacitor,
  isIOS,
  isNative,
  isStandalone,
  isTauri,
  isWeb,
} from "./detection"

// Get extension URL (works for Chrome, Firefox, etc.)
export const getExtensionUrl = (path: string = "index.html"): string => {
  if (typeof window === "undefined") return ""

  // Chrome/Edge extension
  if (typeof chrome !== "undefined" && chrome.runtime?.getURL) {
    return chrome.runtime.getURL(path)
  }

  // Firefox extension
  if (typeof browser !== "undefined" && (browser as any).runtime?.getURL) {
    return (browser as any).runtime.getURL(path)
  }

  // Fallback to current origin
  return `${window.location.origin}/${path}`
}

// Get extension ID (useful for detecting dev vs production)
export const getExtensionId = (): string | null => {
  if (typeof window === "undefined") return null

  // Chrome/Edge extension
  if (typeof chrome !== "undefined" && chrome.runtime?.id) {
    return chrome.runtime.id
  }

  // Firefox extension
  if (typeof browser !== "undefined" && (browser as any).runtime?.id) {
    return (browser as any).runtime.id
  }

  return null
}

// ============================================
// PLATFORM CONTEXT
// ============================================

export interface PlatformContextValue {
  platform: "web" | "ios" | "android" | "extension"
  browser: BrowserType
  device: "mobile" | "tablet" | "desktop"
  os: "ios" | "android" | "macos" | "windows" | "linux" | "unknown"
  isWeb: boolean
  isNative: boolean
  isIOS: boolean
  isAndroid: boolean
  isExtension: boolean
  isStandalone: boolean
  isTauri: boolean
  isCapacitor: boolean
  isChrome: boolean
  isFirefox: boolean
  isSafari: boolean
  isEdge: boolean
  supportsHover: boolean
  supportsTouch: boolean
  supportsKeyboard: boolean
  supportsGestures: boolean
  supportsCamera: boolean
  supportsNotifications: boolean
  isMobile: boolean
  isTablet: boolean
  orientation: "portrait" | "landscape"
  isDesktop: boolean
  viewPortWidth: number
  viewPortHeight: number
  isStorageReady: boolean

  // IDE state
  isIDE: boolean
  toggleIDE: () => void
  idePanelWidth: number
  setIdePanelWidth: (width: number) => void

  styleRegistry: Map<string, Record<string, any>>
  updateStyleRegistry: (newRegistry: Map<string, Record<string, any>>) => void
  BrowserInstance: typeof chrome | null

  // Server-side device detection (from UAParser)
  serverDevice?: {
    vendor?: string
    model?: string
    type?: string
  }
  serverOS?: {
    name?: string
    version?: string
  }
  serverBrowser?: {
    name?: string
    version?: string
    major?: string
  }
}

const PlatformContext = createContext<PlatformContextValue | null>(null)

// ============================================
// PLATFORM PROVIDER
// ============================================

export function PlatformProvider({
  children,
  styleModules = {},
  session,
  ...rest
}: {
  children: ReactNode
  styleModules?: Record<string, Record<string, any>>
  viewPortWidth?: string
  viewPortHeight?: string
  session?: {
    device?: { vendor?: string; model?: string; type?: string }
    os?: { name?: string; version?: string }
    browser?: { name?: string; version?: string; major?: string }
  }
}) {
  const platform = _detectPlatform()
  const browser = _getBrowser()

  // Browser-specific flags
  const isChrome = browser === "chrome"
  const isFirefox = browser === "firefox"
  const isSafari = browser === "safari"
  const isEdge = browser === "edge"

  // Feature detection
  const supportsHover = _isWeb() || _isBrowserExtension()
  const supportsTouch = true // All platforms support touch
  const supportsKeyboard = true // All platforms have keyboard
  const supportsGestures = _isNative()
  const supportsCamera = _isNative()
  const supportsNotifications = true

  // Dimensions - prioritize viewport width from props/cookies for consistent SSR/client rendering
  const [viewportWidthInternal, setViewportWidth] = React.useState<number>(
    () => {
      // Use passed prop if available (from server cookies)
      if (rest.viewPortWidth) {
        return Number.parseInt(rest.viewPortWidth, 10)
      }
      // Fallback to window on client (initial render)
      if (typeof window !== "undefined") {
        return window.innerWidth
      }
      // Default for SSR
      return 1024
    },
  )

  const viewportWidth = Number.parseInt(
    viewportWidthInternal?.toString() ||
      rest.viewPortWidth?.toString() ||
      "1024",
    10,
  )

  // Update viewport width on client after mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.addEventListener) {
      const updateWidth = () => setViewportWidth(window.innerWidth)
      updateWidth() // Set immediately
      window.addEventListener("resize", updateWidth)
      return () => window.removeEventListener("resize", updateWidth)
    }
  }, [])

  const isMobile = _isNative() || (_isWeb() && viewportWidth < 600)

  // SSR-safe: Use viewport width for tablet detection instead of navigator
  const isTablet = viewportWidth >= 600 && viewportWidth < 960

  const isDesktop = _isWeb() && viewportWidth >= 960

  const isTauri = _isTauri()

  // Detect OS - Use server-side UAParser first, then client-side fallback
  const os: "ios" | "android" | "macos" | "windows" | "linux" | "unknown" =
    (() => {
      // Use UAParser OS detection from session (server-side)
      if (session?.os?.name) {
        const osLower = session.os.name.toLowerCase()
        if (osLower.includes("ios")) return "ios"
        if (osLower.includes("android")) return "android"
        if (osLower.includes("mac")) return "macos"
        if (osLower.includes("windows")) return "windows"
        if (osLower.includes("linux")) return "linux"
      }

      // Client-side fallback using navigator.userAgent
      if (typeof window !== "undefined" && typeof navigator !== "undefined") {
        const ua = navigator.userAgent.toLowerCase()

        // iOS detection (iPhone, iPad, iPod)
        if (/iphone|ipad|ipod/.test(ua)) return "ios"

        // Android detection
        if (/android/.test(ua)) return "android"

        // macOS detection
        if (/macintosh|mac os x/.test(ua)) return "macos"

        // Windows detection
        if (/windows|win32|win64/.test(ua)) return "windows"

        // Linux detection
        if (/linux/.test(ua) && !/android/.test(ua)) return "linux"
      }

      // SSR fallback - return unknown
      return "unknown"
    })()

  // Detect device type - SSR-safe: use server-side UAParser detection only
  const device: "mobile" | "tablet" | "desktop" = (() => {
    // Prioritize native platform detection (iOS/Android are always mobile)
    if (_isNative() || _isIOS() || _isAndroid()) return "mobile"

    // Use UAParser device type from session
    if (session?.device?.type === "mobile") return "mobile"
    if (session?.device?.type === "tablet") return "tablet"

    // SSR fallback - use viewport width from cookies (SSR-safe)
    // UAParser returns undefined for desktop, so use viewport as fallback
    if (viewportWidth < 600) return "mobile"
    if (viewportWidth < 960) return "tablet"
    return "desktop"
  })()

  // Create style registry from all style modules (with state for updates)
  const [styleRegistry, setStyleRegistry] = React.useState(() => {
    const registry = new Map<string, Record<string, any>>()

    // Flatten all style modules into the registry
    Object.entries(styleModules).forEach(([moduleName, styles]) => {
      Object.entries(styles).forEach(([className, styleObj]) => {
        registry.set(className, styleObj as Record<string, any>)
      })
    })

    return registry
  })

  // Function to update the registry (for useClsx)
  const updateStyleRegistry = React.useCallback(
    (newRegistry: Map<string, Record<string, any>>) => {
      setStyleRegistry(newRegistry)
    },
    [],
  )

  // Viewport dimensions with cross-platform support
  const [viewPortWidthInternal, setViewPortWidthInternal] = useCookie(
    "viewPortWidth",
    rest.viewPortWidth,
  )

  const viewPortWidth = Number(viewPortWidthInternal) || 0

  const setViewPortWidth = (width: number) => {
    console.log("🔧 setViewPortWidth:", width)
    setViewPortWidthInternal(String(width))
  }
  const [viewPortHeightInternal, setViewPortHeightInternal] = useCookie(
    "viewPortHeight",
    rest.viewPortHeight,
  )

  const viewPortHeight = Number(viewPortHeightInternal) || 0

  const setViewPortHeight = (height: number) => {
    console.log("🔧 setViewPortHeight:", height)
    setViewPortHeightInternal(String(height))
  }

  // IDE state - MUST be defined before viewport effects that use it
  const [isIDE, setIsIDE] = useState(false)
  const [idePanelWidth, setIdePanelWidth] = useState(400) // Default 400px for chat panel

  const toggleIDE = useCallback(() => {
    setIsIDE((prev) => !prev)
  }, [])

  useEffect(() => {
    console.log("🔍 Platform detection:", {
      isWeb: _isWeb(),
      isNative: _isNative(),
      isBrowserExtension: _isBrowserExtension(),
    })

    // Web/Extension: Use window dimensions
    if (_isWeb() || _isBrowserExtension()) {
      if (typeof window === "undefined" || !window.addEventListener) return

      const updateViewportDimensions = () => {
        // Use startTransition to make this a non-blocking update
        startTransition(() => {
          setViewPortWidth(window.innerWidth)
          setViewPortHeight(window.innerHeight)
        })
      }

      // Set initial values
      updateViewportDimensions()

      // Debounce resize to prevent excessive re-renders and Suspense triggers
      let timeoutId: ReturnType<typeof setTimeout>
      const debouncedUpdate = () => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(updateViewportDimensions, 150)
      }

      // Update on resize (debounced)
      window.addEventListener("resize", debouncedUpdate, { passive: true })
      return () => {
        clearTimeout(timeoutId)
        if (window.removeEventListener) {
          window.removeEventListener("resize", debouncedUpdate)
        }
      }
    }

    // Native: Use React Native Dimensions API
    if (_isNative()) {
      console.log("🔍 Running native dimensions code")
      try {
        // Use dynamic import to prevent webpack/turbopack from bundling react-native
        // This will only execute on actual React Native runtime
        const rnModule = "react-native"
        const { Dimensions } = require(rnModule)
        console.log("✅ React Native Dimensions loaded")

        const updateNativeDimensions = () => {
          const { width, height } = Dimensions.get("window")
          console.log("📱 Native dimensions:", { width, height })
          startTransition(() => {
            setViewPortWidth(width)
            setViewPortHeight(height)
          })
        }

        // Set initial values
        updateNativeDimensions()

        // Listen for dimension changes
        const subscription = Dimensions.addEventListener(
          "change",
          updateNativeDimensions,
        )

        return () => {
          if (subscription?.remove) {
            subscription.remove()
          }
        }
      } catch (e) {
        console.error("❌ React Native Dimensions not available:", e)
      }
    }
  }, [setViewPortWidth, setViewPortHeight])

  // Update viewport width when IDE state changes
  useEffect(() => {
    if (_isWeb() || _isBrowserExtension()) {
      if (typeof window === "undefined") return

      startTransition(() => {
        // When IDE is active, set viewport to panel width
        // Otherwise use actual window width
        if (isIDE) {
          setViewPortWidth(idePanelWidth)
        } else {
          setViewPortWidth(window.innerWidth)
        }
      })
    }
  }, [isIDE, idePanelWidth, setViewPortWidth])

  // Platform-specific value selector
  const _select = <T,>(options: {
    web?: T
    native?: T
    ios?: T
    android?: T
    default: T
  }): T => {
    if (_isIOS() && options.ios !== undefined) return options.ios
    if (_isAndroid() && options.android !== undefined) return options.android
    if (_isNative() && options.native !== undefined) return options.native
    if (_isWeb() && options.web !== undefined) return options.web
    return options.default
  }

  // Get browser instance (Chrome/Firefox extension API)
  const BrowserInstance = (() => {
    if (typeof window === "undefined") return null
    if (typeof chrome !== "undefined" && chrome.runtime) return chrome
    // Use globalThis to avoid naming collision with the 'browser' variable above
    const firefoxBrowser = (globalThis as any).browser
    if (firefoxBrowser?.runtime) {
      // Firefox's browser API is compatible with Chrome's API
      return firefoxBrowser as typeof chrome
    }
    return null
  })()

  // Track if storage is ready (for extensions with async storage)
  const [isStorageReady, setIsStorageReady] = useState(!_isBrowserExtension())

  useEffect(() => {
    if (!_isBrowserExtension()) {
      setIsStorageReady(true)
      return
    }

    // For extensions, check if storage API is initialized
    const checkStorageReady = async () => {
      try {
        if (BrowserInstance?.storage?.local) {
          // Write and read to verify storage is truly ready
          await BrowserInstance.storage.local.set({ _storage_check: true })
          await BrowserInstance.storage.local.get("_storage_check")
          setIsStorageReady(true)
        }
      } catch (error) {
        console.error("Extension storage not ready:", error)
        // Retry after a short delay
        setTimeout(checkStorageReady, 100)
      }
    }

    checkStorageReady()
  }, [BrowserInstance])

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const value = useMemo<PlatformContextValue>(
    () => ({
      platform: platform === "native" ? "android" : platform,
      browser,
      device,
      os,
      isWeb: _isWeb(),
      isNative: _isNative(),
      isIOS: _isIOS(),
      isAndroid: _isAndroid(),
      isExtension: _isBrowserExtension(),
      isStandalone: _isStandalone(),
      isChrome,
      isFirefox,
      isSafari,
      isEdge,
      supportsHover,
      supportsTouch,
      supportsKeyboard,
      supportsGestures,
      supportsCamera,
      supportsNotifications,
      isMobile,
      isTablet,
      isTauri,
      isCapacitor: _isCapacitor(),
      isDesktop,
      isStorageReady,
      // IDE state
      isIDE,
      toggleIDE,
      idePanelWidth,
      setIdePanelWidth,
      styleRegistry,
      updateStyleRegistry,
      BrowserInstance,
      orientation: "portrait",
      viewPortWidth,
      viewPortHeight,
      // Server-side detection data
      serverDevice: session?.device,
      serverOS: session?.os,
      serverBrowser: session?.browser,
    }),
    [
      platform,
      browser,
      device,
      os,
      isChrome,
      isFirefox,
      isSafari,
      isEdge,
      supportsHover,
      supportsTouch,
      supportsKeyboard,
      supportsGestures,
      supportsCamera,
      supportsNotifications,
      isMobile,
      isTablet,
      isTauri,
      isDesktop,
      isStorageReady,
      isIDE,
      toggleIDE,
      idePanelWidth,
      setIdePanelWidth,
      styleRegistry,
      updateStyleRegistry,
      BrowserInstance,
      viewPortWidth,
      viewPortHeight,
      session,
    ],
  )

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  )
}

// ============================================
// PLATFORM HOOK
// ============================================

export function usePlatform() {
  const context = useContext(PlatformContext)

  if (!context) {
    throw new Error("usePlatform must be used within PlatformProvider")
  }

  return context
}

// ============================================
// PLATFORM HOC
// ============================================

export function withPlatform<P extends object>(
  Component: React.ComponentType<P & { platform: PlatformContextValue }>,
) {
  return function PlatformComponent(props: P) {
    const platform = usePlatform()
    return <Component {...props} platform={platform} />
  }
}

// ============================================
// PLATFORM UTILITIES
// ============================================

/**
 * Conditionally render based on platform
 */
export function PlatformSwitch({
  web,
  native,
  ios,
  android,
}: {
  web?: ReactNode
  native?: ReactNode
  ios?: ReactNode
  android?: ReactNode
}) {
  const { isIOS, isAndroid, isWeb: _isWeb } = usePlatform()

  if (isIOS && ios) return <>{ios}</>
  if (isAndroid && android) return <>{android}</>
  if (!_isWeb && native) return <>{native}</>
  if (_isWeb && web) return <>{web}</>

  return null
}

/**
 * Show only on web
 */
export function WebOnly({ children }: { children: ReactNode }) {
  const { isWeb: _isWeb } = usePlatform()
  return _isWeb ? <>{children}</> : null
}

/**
 * Show only on native
 */
export function NativeOnly({ children }: { children: ReactNode }) {
  const { isNative: _isNative } = usePlatform()
  return _isNative ? <>{children}</> : null
}

/**
 * Show only on ios
 */
export function IOSOnly({ children }: { children: ReactNode }) {
  const { isIOS: _isIOS } = usePlatform()
  return _isIOS ? <>{children}</> : null
}

/**
 * Show only on Android
 */
export function AndroidOnly({ children }: { children: ReactNode }) {
  const { isAndroid: _isAndroid } = usePlatform()
  return _isAndroid ? <>{children}</> : null
}
