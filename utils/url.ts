/**
 * Server-safe URL utilities
 * These functions can be used in both client and server components
 */

import { locales as localesArray } from "../locales"
import { getThreadId as getThreadIdFromUrl } from "./index"

const baseProtectedRoutes = [
  "threads",
  "about",
  "privacy",
  "terms",
  "why",
  "u",
  "p",
  "blog",
  "tribe",
  "t",
]

export const protectedRoutes = Array.from(
  new Set([...baseProtectedRoutes, ...localesArray]),
)

export const excludedSlugRoutes = Array.from(
  new Set([
    ...protectedRoutes,
    "settings",
    "profile",
    "onboarding",
    "calendar",
    "affiliate",
    "api",
  ]),
)

type SlugExtractionOptions = {
  defaultAppSlug: string
  defaultStoreSlug: string
  excludedRoutes?: string[]
  locales?: readonly string[] | string[]
}

export function getAppAndStoreSlugs(
  path: string,
  {
    defaultAppSlug,
    defaultStoreSlug,
    excludedRoutes = excludedSlugRoutes,
    locales = localesArray,
  }: SlugExtractionOptions,
) {
  const normalizedLocales = Array.isArray(locales) ? locales : []
  const reservedRoutes = new Set([...excludedRoutes, ...protectedRoutes])

  const defaultResult = {
    appSlug: defaultAppSlug,
    storeSlug: defaultStoreSlug,
  }

  if (!path || path === "/") {
    return defaultResult
  }

  const segments = path.split("/").filter(Boolean)
  if (segments.length === 0) {
    return defaultResult
  }

  const [firstSegment, secondSegment, ...rest] = segments

  const localeStrippedSegments = normalizedLocales.includes(firstSegment ?? "")
    ? [secondSegment, ...rest].filter(Boolean)
    : segments

  const cleanedSegments = localeStrippedSegments.filter(
    (segment): segment is string =>
      typeof segment === "string" && segment.length > 0,
  )

  if (cleanedSegments.length === 0) {
    return defaultResult
  }

  if (cleanedSegments[0] && reservedRoutes.has(cleanedSegments[0])) {
    return defaultResult
  }

  const firstReservedIndex = cleanedSegments.findIndex((segment) =>
    reservedRoutes.has(segment),
  )

  if (firstReservedIndex !== -1) {
    if (firstReservedIndex === 0) {
      return defaultResult
    }

    const appSlugCandidate = cleanedSegments[firstReservedIndex - 1]
    const storeSlugCandidate = cleanedSegments[firstReservedIndex - 2]

    return {
      appSlug: appSlugCandidate || defaultAppSlug,
      storeSlug:
        (storeSlugCandidate && !reservedRoutes.has(storeSlugCandidate)
          ? storeSlugCandidate
          : undefined) || defaultStoreSlug,
    }
  }

  const appSlug = cleanedSegments[cleanedSegments.length - 1]

  const storeSlug = cleanedSegments[cleanedSegments.length - 2]

  return {
    appSlug: appSlug || defaultAppSlug,
    storeSlug:
      (storeSlug && !reservedRoutes.has(storeSlug) ? storeSlug : undefined) ||
      defaultStoreSlug,
  }
}

// Utility to extract and validate UUID from the last path segment of a URL

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

  return getThreadIdFromUrl(pathname)
}
