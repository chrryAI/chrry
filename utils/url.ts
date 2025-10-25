/**
 * Server-safe URL utilities
 * These functions can be used in both client and server components
 */

// Utility to extract and validate UUID from the last path segment of a URL
// UUID v4 regex: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function getLastUuidFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url, "http://localhost") // base needed for relative paths
    const segments = urlObj.pathname.split("/").filter(Boolean)
    const last = segments[segments.length - 1]
    if (last && isValidUuidV4(last)) return last
    return null
  } catch {
    return null
  }
}

export function isValidUuidV4(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    uuid,
  )
}

export function getThreadId(pathname?: string): string | undefined {
  // Server-safe: check if window exists
  const path =
    pathname ||
    (typeof window !== "undefined" ? window.location.pathname : undefined)
  if (!path || !path.includes("/threads/")) return undefined

  const result = path.split("/").pop()?.split("?")[0]?.split("&")[0]

  return result
}

export const protectedRoutes = ["threads", "about", "why", "privacy", "terms"]
