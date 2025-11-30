/**
 * Native SWR Cache Provider (React Native)
 * Uses MMKV for lightning-fast persistent storage
 */

import { useState, useEffect } from "react"
import type { Cache } from "swr"

// TTL for cache entries (1 hour)
const CACHE_TTL = 60 * 60 * 1000

// SWR provider signature
type CacheProvider = (cache: Readonly<Cache<any>>) => Cache<any>

interface CacheEntry<T = unknown> {
  data: T
  ts: number
}

// Initialize MMKV storage for SWR cache (runtime require to avoid bundler issues)
let storage: any = null
try {
  const { MMKV } = require("react-native-mmkv")
  storage = new MMKV({ id: "swr-cache" })
} catch (error) {
  console.warn("[SWR Cache] MMKV initialization failed:", error)
}

/**
 * MMKV-based SWR cache provider for React Native
 */
function createMMKVCacheProvider(): CacheProvider {
  // In-memory cache for fast access
  const memoryCache = new Map<string, any>()

  // Load existing cache from MMKV into memory on init
  if (storage) {
    try {
      const keys = storage.getAllKeys()
      let loadedCount = 0
      let expiredCount = 0

      for (const key of keys) {
        if (key.startsWith("swr:")) {
          const value = storage.getString(key)
          if (value) {
            try {
              const entry: CacheEntry = JSON.parse(value)
              // Check TTL
              if (Date.now() - entry.ts < CACHE_TTL) {
                memoryCache.set(key.replace("swr:", ""), entry.data)
                loadedCount++
              } else {
                // Expired, delete it
                storage.delete(key)
                expiredCount++
              }
            } catch {
              // Invalid JSON, skip
            }
          }
        }
      }

      if (loadedCount > 0 || expiredCount > 0) {
        console.log(
          `✅ MMKV SWR cache: loaded ${loadedCount}, expired ${expiredCount}`,
        )
      }
    } catch (error) {
      console.error("Failed to load MMKV cache:", error)
    }
  }

  return () => ({
    get(key: string) {
      return memoryCache.get(key)
    },

    set(key: string, value: any) {
      memoryCache.set(key, value)

      // Persist to MMKV
      if (storage) {
        try {
          const entry: CacheEntry = { data: value, ts: Date.now() }
          storage.set(`swr:${key}`, JSON.stringify(entry))
        } catch (error) {
          console.error("Failed to persist to MMKV:", error)
        }
      }
    },

    delete(key: string) {
      memoryCache.delete(key)

      if (storage) {
        try {
          storage.delete(`swr:${key}`)
        } catch (error) {
          console.error("Failed to delete from MMKV:", error)
        }
      }
    },

    keys() {
      return memoryCache.keys()
    },
  })
}

/**
 * Get the cache provider (MMKV on native)
 */
export async function getCacheProvider(): Promise<CacheProvider> {
  return createMMKVCacheProvider()
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
