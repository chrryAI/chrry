/**
 * Platform Detection Utilities
 * Standalone functions with no dependencies to avoid circular imports
 */

/// <reference types="chrome" />

export type PlatformType = "web" | "ios" | "android" | "native" | "extension"
export type BrowserType = "chrome" | "firefox" | "safari" | "edge" | "unknown"

/**
 * Detect if running on web (browser)
 */
export function isWeb(): boolean {
  return (
    !isNative() &&
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
    // @ts-ignore - React Native Platform
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
    // @ts-ignore - React Native Platform
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
