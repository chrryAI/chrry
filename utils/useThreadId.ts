"use client"

/**
 * Client-only hook for getting thread ID from URL
 */

import { useNavigation } from "../platform"
import { getThreadId } from "./url"

// React hook to get the thread UUID from the current window location
// Returns the UUID string if valid, otherwise null
export function useThreadId(pathname?: string): string | undefined {
  const { pathname: contextPathname } = useNavigation()

  return getThreadId(pathname || contextPathname)
}
