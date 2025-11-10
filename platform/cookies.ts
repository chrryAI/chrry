/**
 * Cross-platform cookie utilities
 * Works on web, native (AsyncStorage), and browser extensions
 */

/// <reference types="chrome" />

import { useState, useEffect, useCallback } from "react"
import { isNative, isBrowserExtension } from "./PlatformProvider"
import { platformStorage, storage } from "./storage"

// Cookie options
export interface CookieOptions {
  maxAge?: number // seconds
  expires?: Date
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: "strict" | "lax" | "none"
}

/**
 * Cross-platform cookie hook
 * - Web: Uses document.cookie
 * - Native: Uses AsyncStorage/MMKV (no real cookies)
 * - Extension: Uses chrome.cookies API or localStorage fallback
 */
export function useCookie(
  key: string,
  initialValue: string = "",
): [string, (value: string, options?: CookieOptions) => void, () => void] {
  const [value, setValue] = useState<string>(initialValue)

  // Load cookie on mount
  useEffect(() => {
    const loadCookie = async () => {
      const cookieValue = await getCookie(key)
      if (cookieValue !== null) {
        setValue(cookieValue)
      } else if (initialValue) {
        // If no cookie exists but we have an initial value, set it
        await setCookieValue(key, initialValue)
      }
    }
    loadCookie()
  }, [key, initialValue])

  // Set cookie
  const setCookie = useCallback(
    async (newValue: string, options?: CookieOptions) => {
      setValue(newValue)
      await setCookieValue(key, newValue, options)
    },
    [key],
  )

  // Remove cookie
  const removeCookie = useCallback(async () => {
    setValue(initialValue)
    await deleteCookie(key)
  }, [key, initialValue])

  return [value, setCookie, removeCookie]
}

/**
 * Get cookie value synchronously (web only, for SSR/initial load)
 */
export function getCookieSync(key: string): string | null {
  // Only works on web with document.cookie
  if (typeof document !== "undefined") {
    const cookies = document.cookie.split(";")
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split("=").map((c) => c.trim())
      if (cookieName === key && cookieValue) {
        return decodeURIComponent(cookieValue)
      }
    }
  }
  return null
}

/**
 * Get cookie value (cross-platform)
 */
async function getCookie(key: string): Promise<string | null> {
  // Native: Use storage
  if (isNative()) {
    return storage.getItem(key)
  }

  // Extension: Try chrome.cookies API first
  if (isBrowserExtension()) {
    try {
      // Chrome extension cookies API
      if (
        typeof chrome !== "undefined" &&
        chrome.cookies &&
        window.location?.href
      ) {
        return new Promise((resolve) => {
          chrome.cookies.get(
            { url: window.location.href, name: key },
            (cookie) => {
              resolve(cookie?.value || null)
            },
          )
        })
      }

      // Firefox extension cookies API
      if (typeof browser !== "undefined" && (browser as any).cookies) {
        const cookie = await (browser as any).cookies.get({
          url: window.location.href,
          name: key,
        })
        return cookie?.value || null
      }
    } catch {
      // Fall through to localStorage
    }

    // Fallback to localStorage for extensions
    return await storage.getItem(key)
  }

  // Web: Use document.cookie
  if (typeof document !== "undefined") {
    const cookies = document.cookie.split(";")
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split("=").map((c) => c.trim())
      if (cookieName === key && cookieValue) {
        return decodeURIComponent(cookieValue)
      }
    }
  }

  return null
}

/**
 * Set cookie value (cross-platform)
 */
async function setCookieValue(
  key: string,
  value: string,
  options: CookieOptions = {},
): Promise<void> {
  // Native: Use storage (no real cookies)
  if (isNative()) {
    storage.setItem(key, value)
    return
  }

  // Extension: Try chrome.cookies API first
  if (isBrowserExtension()) {
    try {
      // Chrome extension cookies API
      if (
        typeof chrome !== "undefined" &&
        chrome.cookies &&
        window.location?.href
      ) {
        // Map sameSite to Chrome's expected values
        let chromeSameSite:
          | "strict"
          | "lax"
          | "no_restriction"
          | "unspecified"
          | undefined
        if (options.sameSite === "none") {
          chromeSameSite = "no_restriction"
        } else if (options.sameSite) {
          chromeSameSite = options.sameSite
        }

        return new Promise((resolve) => {
          chrome.cookies.set(
            {
              url: window.location.href,
              name: key,
              value: value,
              expirationDate: options.expires
                ? Math.floor(options.expires.getTime() / 1000)
                : undefined,
              path: options.path,
              domain: options.domain,
              secure: options.secure,
              sameSite: chromeSameSite,
            },
            () => resolve(),
          )
        })
      }

      // Firefox extension cookies API
      if (typeof browser !== "undefined" && (browser as any).cookies) {
        await (browser as any).cookies.set({
          url: window.location.href,
          name: key,
          value: value,
          expirationDate: options.expires
            ? Math.floor(options.expires.getTime() / 1000)
            : undefined,
          path: options.path,
          domain: options.domain,
          secure: options.secure,
          sameSite: options.sameSite,
        })
        return
      }
    } catch {
      // Fall through to localStorage
    }

    // Fallback to localStorage for extensions
    storage.setItem(key, value)
    return
  }

  // Web: Use document.cookie
  if (typeof document !== "undefined") {
    let cookieString = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`

    if (options.maxAge) {
      cookieString += `; max-age=${options.maxAge}`
    }

    if (options.expires) {
      cookieString += `; expires=${options.expires.toUTCString()}`
    }

    // Always set path to root if not specified
    cookieString += `; path=${options.path || "/"}`

    if (options.domain) {
      cookieString += `; domain=${options.domain}`
    }

    if (options.secure) {
      cookieString += "; secure"
    }

    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`
    }

    document.cookie = cookieString
  }
}

/**
 * Delete cookie (cross-platform)
 */
async function deleteCookie(key: string): Promise<void> {
  // Native: Remove from storage
  if (isNative()) {
    storage.removeItem(key)
    return
  }

  // Extension: Try chrome.cookies API first
  if (isBrowserExtension()) {
    try {
      // Chrome extension cookies API
      if (typeof chrome !== "undefined" && chrome.cookies) {
        return new Promise((resolve) => {
          chrome.cookies.remove({ url: window.location.href, name: key }, () =>
            resolve(),
          )
        })
      }

      // Firefox extension cookies API
      if (typeof browser !== "undefined" && (browser as any).cookies) {
        await (browser as any).cookies.remove({
          url: window.location.href,
          name: key,
        })
        return
      }
    } catch {
      // Fall through to localStorage
    }

    // Fallback to localStorage for extensions
    storage.removeItem(key)
    return
  }

  // Web: Set cookie with past expiration
  if (typeof document !== "undefined") {
    document.cookie = `${encodeURIComponent(key)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  }
}

/**
 * Get all cookies (cross-platform)
 */
export async function getAllCookies(): Promise<Record<string, string>> {
  const cookies: Record<string, string> = {}

  // Native: Not applicable (use storage keys instead)
  if (isNative()) {
    return cookies
  }

  // Extension: Try chrome.cookies API
  if (isBrowserExtension()) {
    try {
      if (typeof chrome !== "undefined" && chrome.cookies) {
        return new Promise((resolve) => {
          chrome.cookies.getAll({ url: window.location.href }, (cookieList) => {
            const result: Record<string, string> = {}
            cookieList.forEach((cookie) => {
              result[cookie.name] = cookie.value
            })
            resolve(result)
          })
        })
      }

      if (typeof browser !== "undefined" && (browser as any).cookies) {
        const cookieList = await (browser as any).cookies.getAll({
          url: window.location.href,
        })
        cookieList.forEach((cookie: any) => {
          cookies[cookie.name] = cookie.value
        })
        return cookies
      }
    } catch {
      // Fall through to document.cookie
    }
  }

  // Web: Parse document.cookie
  if (typeof document !== "undefined") {
    const cookieStrings = document.cookie.split(";")
    for (const cookie of cookieStrings) {
      const [name, value] = cookie.split("=").map((c) => c.trim())
      if (name && value) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value)
      }
    }
  }

  return cookies
}

/**
 * Direct cookie access (non-hook)
 */
export const platformCookies = {
  get: getCookie,
  set: setCookieValue,
  delete: deleteCookie,
  getAll: getAllCookies,
}
