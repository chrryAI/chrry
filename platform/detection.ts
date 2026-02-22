/**
 * Platform Detection Utilities
 * Standalone functions with no dependencies to avoid circular imports
 */

/// <reference types="chrome" />

// React Native Platform API type declaration
declare const Platform:
  | {
      OS: "ios" | "android" | "windows" | "macos" | "web"
      Version?: number | string
      select: <T>(obj: { ios?: T; android?: T; native?: T; default: T }) => T
    }
  | undefined

export type PlatformType = "web" | "ios" | "android" | "native" | "extension"
export type BrowserType = "chrome" | "firefox" | "safari" | "edge" | "unknown"

/**
 * Detect if running on web (browser)
 */
export function isWeb(): boolean {
  return (
    !isNative() &&
    // !isBrowserExtension() &&
    typeof window !== "undefined" &&
    typeof document !== "undefined"
  )
}

/**
 * Detect if running on React Native
 */
export function isNative(): boolean {
  // Check for React Native global
  return typeof navigator !== "undefined" && navigator.product === "ReactNative"
}

/**
 * Detect if running on iOS (React Native or Safari)
 */
export function isIOS(): boolean {
  // React Native iOS
  if (isNative()) {
    // React Native Platform
    return typeof Platform !== "undefined" && Platform.OS === "ios"
  }

  // Web iOS (Safari/Chrome on iPhone/iPad)
  if (typeof navigator !== "undefined") {
    const ua = navigator.userAgent || ""
    const platform =
      (navigator as any).userAgentData?.platform || navigator.platform || ""

    // Check for iPhone, iPad, iPod
    if (/iPhone|iPad|iPod/.test(ua) || /iPhone|iPad|iPod/.test(platform)) {
      return true
    }

    // Check for iOS 13+ on iPad (reports as Mac)
    if (/Mac/.test(platform) && navigator.maxTouchPoints > 1) {
      return true
    }
  }

  return false
}

/**
 * Detect if running on Android (React Native or Chrome/Browser)
 */
export function isAndroid(): boolean {
  // React Native Android
  if (isNative()) {
    return typeof Platform !== "undefined" && Platform.OS === "android"
  }

  // Web Android (Chrome/Firefox on Android)
  if (typeof navigator !== "undefined") {
    const ua = navigator.userAgent || ""
    return /Android/.test(ua)
  }

  return false
}

/**
 * Detect if running as browser extension
 */
export function isBrowserExtension(): boolean {
  if (typeof window === "undefined") return false

  // Check for Chrome extension API
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id) {
    return true
  }

  // Check for Firefox extension API
  if (typeof browser !== "undefined" && (browser as any).runtime?.id) {
    return true
  }

  return false
}

/**
 * Detect if running as standalone PWA
 */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false

  // ios standalone
  if ((window.navigator as any).standalone === true) {
    return true
  }

  // Android/Chrome standalone
  if (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(display-mode: standalone)").matches
  ) {
    return true
  }

  return false
}

/**
 * Detect if running in Tauri desktop app
 */
export function isTauri(): boolean {
  if (typeof window === "undefined") return false

  // Check for Tauri API presence
  return (
    "__TAURI__" in window ||
    "__TAURI_INTERNALS__" in window ||
    "TAURI_EVENT_PLUGIN_INTERNALS" in window
  )
}

/**
 * Detect if running in Capacitor mobile app
 */
export function isCapacitor(): boolean {
  if (typeof window === "undefined") return false

  // Check for Capacitor API presence
  const capacitor = (window as any).Capacitor
  if (!capacitor) return false

  // Check strict native platform
  if (typeof capacitor.isNativePlatform === "function") {
    return capacitor.isNativePlatform()
  }

  // Fallback: check platform property
  return capacitor.platform !== "web"
}

/**
 * Detect browser type
 */
export function getBrowser(): BrowserType {
  if (typeof navigator === "undefined" || !navigator.userAgent) return "unknown"

  const ua = navigator.userAgent.toLowerCase()

  if (ua.includes("edg/")) return "edge"
  if (ua.includes("chrome")) return "chrome"
  if (ua.includes("firefox")) return "firefox"
  if (ua.includes("safari") && !ua.includes("chrome")) return "safari"

  return "unknown"
}

/**
 * Detect platform type
 */
export function detectPlatform(): PlatformType {
  if (isBrowserExtension()) return "extension"
  if (isIOS()) return "ios"
  if (isAndroid()) return "android"
  if (isNative()) return "native"
  if (isWeb()) return "web"

  return "web" // Default fallback
}
