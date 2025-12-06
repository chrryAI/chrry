/**
 * Cross-platform cookie utilities
 * Works on web, native (AsyncStorage), and browser extensions
 */

/// <reference types="chrome" />

import { useState, useCallback } from "react"
import { isNative, isBrowserExtension } from "./PlatformProvider"
import { storage } from "./storage"
import { getExtensionUrls } from "../utils"

const isBrowser = typeof window !== "undefined"

// Cookie options
export interface CookieOptions {
  days?: number
  maxAge?: number // seconds
  expires?: Date
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: "strict" | "lax" | "none"
}

/**
 * Stringify cookie options for document.cookie
 */
export function stringifyOptions(options: CookieOptions) {
  return Object.keys(options).reduce((acc, key) => {
    if (key === "days") {
      return acc
    } else {
      const value = options[key as keyof CookieOptions]
      if (value === false) {
        return acc
      } else if (value === true) {
        return `${acc}; ${key}`
      } else if (value) {
        return `${acc}; ${key}=${value}`
      }
      return acc
    }
  }, "")
}

/**
 * Set cookie (web-only, synchronous)
 */
export const setCookieWeb = (
  name: string,
  value: string,
  options: CookieOptions = {},
) => {
  if (!isBrowser) return

  const optionsWithDefaults = {
    days: 7,
    path: "/",
    ...options,
  }

  const expires = new Date(
    Date.now() + (optionsWithDefaults.days || 7) * 864e5,
  ).toUTCString()

  document.cookie =
    name +
    "=" +
    encodeURIComponent(value) +
    "; expires=" +
    expires +
    stringifyOptions(optionsWithDefaults)
}

/**
 * Get cookie (web-only, synchronous)
 */
export const getCookieWeb = (name: string, initialValue = "") => {
  return (
    (isBrowser &&
      document.cookie.split("; ").reduce((r, v) => {
        const parts = v.split("=")
        return parts[0] === name && parts[1] ? decodeURIComponent(parts[1]) : r
      }, "")) ||
    initialValue
  )
}

/**
 * Remove cookie (web-only, synchronous)
 */
export const removeCookieWeb = (name: string) => {
  if (!isBrowser) return
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

/**
 * Cross-platform cookie hook
 * - Web: Uses document.cookie (synchronous)
 * - Native: Uses AsyncStorage/MMKV
 * - Extension: Uses localStorage fallback
 */
export function useCookie(
  key: string,
  initialValue: string = "",
): [string, (value: string, options?: CookieOptions) => void, () => void] {
  // For web: use synchronous cookie access
  if (isBrowser && !isNative() && !isBrowserExtension()) {
    const [item, setItem] = useState<string>(() => {
      const existingCookie = getCookieWeb(key, "")

      // If cookie doesn't exist and we have an initialValue, set it
      if (!existingCookie && initialValue) {
        setCookieWeb(key, initialValue)
        return initialValue
      }

      return existingCookie || initialValue
    })

    const updateItem = useCallback(
      (value: string, options?: CookieOptions) => {
        setItem(value)
        setCookieWeb(key, value, options)
      },
      [key],
    )

    const removeItem = useCallback(() => {
      setItem(initialValue)
      removeCookieWeb(key)
    }, [key, initialValue])

    return [item, updateItem, removeItem]
  }

  // For native/extension: use async storage
  const [value, setValue] = useState<string>(initialValue)

  const updateItem = useCallback(
    (newValue: string, _options?: CookieOptions) => {
      setValue(newValue)
      storage.setItem(key, newValue)
    },
    [key],
  )

  const removeItem = useCallback(() => {
    setValue(initialValue)
    storage.removeItem(key)
  }, [key, initialValue])

  return [value, updateItem, removeItem]
}

/**
 * Get cookie value synchronously (web only, for SSR/initial load)
 */
export function getCookieSync(key: string): string | null {
  // Only works on web with document.cookie
  if (typeof document !== "undefined" && document.cookie) {
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
      // Use the website URLs, not current tab
      const websiteUrls = getExtensionUrls()

      const final = []
      // Chrome extension cookies API
      if (typeof chrome !== "undefined" && chrome.cookies) {
        for (const url of websiteUrls) {
          const cookie = await new Promise<chrome.cookies.Cookie | null>(
            (resolve) => {
              chrome.cookies.get({ url, name: key }, (cookie) => {
                if (chrome.runtime.lastError) {
                  resolve(null)
                } else {
                  resolve(cookie)
                }
              })
            },
          )

          if (cookie?.value) {
            final.push(cookie?.value)
          }
        }

        // Mark cookies as ready after first successful check
        // This helps AuthProvider know when it's safe to fetch session
        if (key === "token") {
          storage.setItem("_cookiesReady", "true")
        }

        // Smart selection: for tokens, pick the longest (likely valid JWT)
        // For fingerprint/deviceId (UUIDs), pick first valid one
        // For others, use localStorage
        if (final.length) {
          if (key === "token") {
            return final.sort((a, b) => b.length - a.length)[0] || null // Longest token
          }

          return final[0] || null // First found for other cookies
        }
        return await storage.getItem(key)
      }

      // Firefox extension cookies API
      if (typeof browser !== "undefined" && (browser as any).cookies) {
        for (const url of websiteUrls) {
          const cookie = await (browser as any).cookies.get({ url, name: key })
          if (cookie?.value) {
            return cookie.value
          }
        }
        // No cookie found, fall back to localStorage
        return await storage.getItem(key)
      }
    } catch {
      // Fall through to localStorage
    }

    // Fallback to localStorage for extensions
    return await storage.getItem(key)
  }

  // Web: Use document.cookie
  if (typeof document !== "undefined" && document.cookie) {
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
 *
 * Note: For cross-subdomain authentication, the server (NextAuth) already sets
 * cookies with domain=".chrry.ai", so they work across all subdomains automatically.
 * No need to duplicate that logic here.
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

  // Extension: persist in extension storage
  // Note: Server already sets cross-subdomain cookies (domain=".chrry.ai")
  // so we don't need to duplicate that here
  if (isBrowserExtension()) {
    console.log("Setting cookie in extension storage:", key, value)
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
  if (typeof document !== "undefined" && document.cookie) {
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
