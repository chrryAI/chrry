/**
 * Cross-platform SWR Cache Provider
 * - Web: Uses IndexedDB via @piotr-cz/swr-idb-cache
 * - Native: Uses in-memory cache (MMKV support via platform-specific imports)
 */

import { useState, useEffect } from "react"
import type { Cache } from "swr"

// TTL for cache entries (1 hour)
const CACHE_TTL = 60 * 60 * 1000

// SWR provider signature
type CacheProvider = (cache: Readonly<Cache<any>>) => Cache<any>

/**
 * Simple in-memory cache provider (used as fallback)
 */
function createMemoryCacheProvider(): CacheProvider {
  const cache = new Map<string, any>()
  return () => cache
}

/**
 * IndexedDB-based SWR cache provider for Web
 * Uses @piotr-cz/swr-idb-cache with garbage collection
 */
async function createIDBCacheProvider(): Promise<CacheProvider> {
  try {
    const { default: createCacheProvider, timestampStorageHandler } =
      await import("@piotr-cz/swr-idb-cache")

    // Custom storage handler with TTL-based garbage collection
    const gcStorageHandler = {
      ...timestampStorageHandler,
      revive: (key: string, storeObject: { ts: number; value: unknown }) => {
        // Only revive if not expired
        if (storeObject.ts > Date.now() - CACHE_TTL) {
          return timestampStorageHandler.revive(key, storeObject)
        }
        // Return undefined to indicate stale
        return undefined
      },
    }

    const provider = await createCacheProvider({
      dbName: "vex-swr-cache",
      storeName: "cache",
      storageHandler: gcStorageHandler,
    })

    console.log("✅ IndexedDB SWR cache initialized")
    // Cast to our CacheProvider type - the library's type is compatible at runtime
    return provider as unknown as CacheProvider
  } catch (error) {
    console.error("Failed to create IDB cache provider:", error)
    // Fallback to in-memory Map
    return (() => new Map()) as unknown as CacheProvider
  }
}

/**
 * Get the appropriate cache provider based on platform
 */
export async function getCacheProvider(): Promise<CacheProvider> {
  // Web: Use IndexedDB if available
  if (typeof indexedDB !== "undefined") {
    return await createIDBCacheProvider()
  }

  // Native or fallback: In-memory cache
  // Note: For native MMKV support, use platform-specific imports
  console.warn("[SWR Cache] IndexedDB not available, using in-memory cache")
  return createMemoryCacheProvider()
}

/**
 * Hook version for use in components
 * Returns null while initializing, then the provider
 */
export function useSWRCacheProvider(): CacheProvider | null {
  const [provider, setProvider] = useState<CacheProvider | null>(null)

  useEffect(() => {
    let mounted = true

    getCacheProvider().then((p) => {
      if (mounted) {
        setProvider(() => p)
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  return provider
}

export default getCacheProvider
