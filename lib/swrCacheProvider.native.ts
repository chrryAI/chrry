/**
 * Cross-platform SWR Cache Provider - Native
 * Uses MMKV for persistent storage with TTL-based garbage collection
 *
 * Features:
 * - Ultra-fast MMKV storage (synchronous reads/writes)
 * - TTL-based expiration with automatic cleanup
 * - Schema versioning with migration support
 * - LRU eviction when max entries exceeded
 * - Background garbage collection
 * - Graceful degradation to memory on errors
 */

import type { Cache } from "swr"

// -----------------------------------------
// Configuration
// -----------------------------------------

export interface CacheConfig {
  /** Time-to-live in milliseconds (default: 1 hour) */
  ttl: number
  /** Maximum number of cache entries (default: 1000) */
  maxEntries: number
  /** Background GC interval in milliseconds (default: 5 minutes) */
  gcInterval: number
  /** Number of entries to evict when max is reached (default: 100) */
  evictionBatchSize: number
}

const DEFAULT_CONFIG: CacheConfig = {
  ttl: 60 * 60 * 1000, // 1 hour
  maxEntries: 1000,
  gcInterval: 5 * 60 * 1000, // 5 minutes
  evictionBatchSize: 100,
}

// Current schema version - increment when making breaking changes
const SCHEMA_VERSION = 2

// Metadata key for storing cache metadata
const METADATA_KEY = "__swr_cache_metadata__"

// -----------------------------------------
// Cache Entry Type
// -----------------------------------------

interface CacheEntry {
  value: any
  ts: number // Created/updated timestamp
  lastAccess: number // Last access timestamp for LRU
  version: number // Schema version for migrations
}

interface CacheMetadata {
  schemaVersion: number
  entryCount: number
  lastGC: number
}

// -----------------------------------------
// MMKV Storage
// -----------------------------------------

let MMKVStorage: any = null

try {
  MMKVStorage = require("react-native-mmkv").MMKV
} catch {
  console.warn("[SWR Cache] MMKV not available, using memory")
}

// -----------------------------------------
// MMKV Provider Factory
// -----------------------------------------

function createMMKVProvider(config: CacheConfig = DEFAULT_CONFIG): Cache {
  if (!MMKVStorage) {
    return createMemoryProvider()
  }

  const mmkv = new MMKVStorage({ id: "swr-cache-v2" })

  // In-memory index for fast key lookups and LRU tracking
  const keyIndex = new Map<string, { ts: number; lastAccess: number }>()

  // Track if we're in degraded mode
  let degradedMode = false

  // GC timer reference
  let gcTimer: ReturnType<typeof setInterval> | null = null

  // -----------------------------------------
  // Helper Functions
  // -----------------------------------------

  function getEntry(key: string): CacheEntry | null {
    try {
      const json = mmkv.getString(key)
      if (!json) return null
      return JSON.parse(json) as CacheEntry
    } catch {
      return null
    }
  }

  function setEntry(key: string, entry: CacheEntry): boolean {
    try {
      mmkv.set(key, JSON.stringify(entry))
      keyIndex.set(key, { ts: entry.ts, lastAccess: entry.lastAccess })
      return true
    } catch (error) {
      console.error("[SWR Cache] Failed to set entry:", error)
      return false
    }
  }

  function deleteEntry(key: string): void {
    try {
      mmkv.delete(key)
      keyIndex.delete(key)
    } catch (error) {
      console.error("[SWR Cache] Failed to delete entry:", error)
    }
  }

  // -----------------------------------------
  // Garbage Collection
  // -----------------------------------------

  function runGarbageCollection(): void {
    if (degradedMode) return

    try {
      const now = Date.now()
      const allKeys = mmkv
        .getAllKeys()
        .filter((k: string) => k !== METADATA_KEY)
      let expiredCount = 0
      let evictedCount = 0

      // 1. Delete expired entries
      for (const key of allKeys) {
        const entry = getEntry(key)
        if (entry && now - entry.ts > config.ttl) {
          deleteEntry(key)
          expiredCount++
        }
      }

      // 2. Check count and evict LRU if needed
      const remainingKeys = mmkv
        .getAllKeys()
        .filter((k: string) => k !== METADATA_KEY)

      if (remainingKeys.length > config.maxEntries) {
        // Build LRU list from index or by reading entries
        const lruList: Array<{ key: string; lastAccess: number }> = []

        for (const key of remainingKeys) {
          const indexed = keyIndex.get(key)
          if (indexed) {
            lruList.push({ key, lastAccess: indexed.lastAccess })
          } else {
            const entry = getEntry(key)
            if (entry) {
              lruList.push({ key, lastAccess: entry.lastAccess || entry.ts })
            }
          }
        }

        // Sort by lastAccess (oldest first)
        lruList.sort((a, b) => a.lastAccess - b.lastAccess)

        // Evict oldest entries
        const toEvict =
          remainingKeys.length - config.maxEntries + config.evictionBatchSize
        for (let i = 0; i < Math.min(toEvict, lruList.length); i++) {
          const entry = lruList[i]
          if (entry) {
            deleteEntry(entry.key)
            evictedCount++
          }
        }
      }

      if (expiredCount > 0 || evictedCount > 0) {
        console.debug(
          `[SWR Cache] GC: Removed ${expiredCount} expired, evicted ${evictedCount ?? 0} LRU`,
        )
      }

      // Update metadata
      const metadata: CacheMetadata = {
        schemaVersion: SCHEMA_VERSION,
        entryCount: mmkv.getAllKeys().filter((k: string) => k !== METADATA_KEY)
          .length,
        lastGC: now,
      }
      mmkv.set(METADATA_KEY, JSON.stringify(metadata))
    } catch (error) {
      console.warn("[SWR Cache] GC failed:", error)
    }
  }

  // -----------------------------------------
  // Initialize
  // -----------------------------------------

  function initialize(): void {
    try {
      const now = Date.now()
      const allKeys = mmkv
        .getAllKeys()
        .filter((k: string) => k !== METADATA_KEY)

      let loadedCount = 0
      let expiredCount = 0
      let migratedCount = 0

      for (const key of allKeys) {
        const entry = getEntry(key)
        if (!entry) continue

        // Check if entry needs migration
        if (!entry.version || entry.version < SCHEMA_VERSION) {
          const migrated: CacheEntry = {
            value: entry.value,
            ts: entry.ts,
            lastAccess: entry.lastAccess || entry.ts,
            version: SCHEMA_VERSION,
          }
          setEntry(key, migrated)
          migratedCount++
        }

        // Check expiration
        if (now - entry.ts <= config.ttl) {
          keyIndex.set(key, {
            ts: entry.ts,
            lastAccess: entry.lastAccess || entry.ts,
          })
          loadedCount++
        } else {
          deleteEntry(key)
          expiredCount++
        }
      }

      console.debug(
        `[SWR Cache] Initialized: ${loadedCount} loaded, ${expiredCount} expired, ${migratedCount} migrated`,
      )

      // Start background GC
      gcTimer = setInterval(runGarbageCollection, config.gcInterval)

      // Run initial GC after a short delay
      setTimeout(runGarbageCollection, 1000)
    } catch (error) {
      console.warn("[SWR Cache] Failed to initialize:", error)
      degradedMode = true
    }
  }

  // Start initialization
  initialize()

  // -----------------------------------------
  // Cache Interface (Map-compatible for SWR)
  // -----------------------------------------

  const cache: Cache & {
    has: (key: string) => boolean
    clear: () => void
    readonly size: number
  } = {
    get: (key: string) => {
      if (degradedMode) return undefined

      const entry = getEntry(key)
      if (!entry) return undefined

      const now = Date.now()

      // Check expiration
      if (now - entry.ts > config.ttl) {
        deleteEntry(key)
        return undefined
      }

      // Update lastAccess for LRU tracking
      entry.lastAccess = now
      setEntry(key, entry)

      return entry.value
    },

    set: (key: string, value: any) => {
      if (degradedMode) return

      const entry: CacheEntry = {
        value,
        ts: Date.now(),
        lastAccess: Date.now(),
        version: SCHEMA_VERSION,
      }

      if (!setEntry(key, entry)) {
        // Storage might be full, try GC
        runGarbageCollection()
        if (!setEntry(key, entry)) {
          console.warn("[SWR Cache] Switching to degraded mode")
          degradedMode = true
        }
      }
    },

    delete: (key: string) => {
      if (degradedMode) return
      deleteEntry(key)
    },

    keys: () => {
      if (degradedMode) return [][Symbol.iterator]()

      const allKeys = mmkv
        .getAllKeys()
        .filter((k: string) => k !== METADATA_KEY)
      return allKeys[Symbol.iterator]()
    },

    // Additional Map-like methods for compatibility
    has: (key: string) => {
      if (degradedMode) return false
      return getEntry(key) !== null
    },

    clear: () => {
      keyIndex.clear()
      if (!degradedMode) {
        try {
          mmkv.clearAll()
        } catch (error) {
          console.error("[SWR Cache] Failed to clear MMKV:", error)
        }
      }
    },

    get size() {
      if (degradedMode) return 0
      return keyIndex.size
    },
  }

  return cache
}

// -----------------------------------------
// Memory Fallback Provider
// -----------------------------------------

function createMemoryProvider(): Cache {
  const cache = new Map<string, any>()
  return cache as Cache
}

// -----------------------------------------
// Cache Utilities (exported for external use)
// -----------------------------------------

/**
 * Clear all cache entries
 */
export function clearCache(): void {
  if (!MMKVStorage) return

  try {
    const mmkv = new MMKVStorage({ id: "swr-cache-v2" })
    mmkv.clearAll()
    console.debug("[SWR Cache] Cache cleared")
  } catch (error) {
    console.error("[SWR Cache] Failed to clear cache:", error)
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalEntries: number
  oldestEntry: number | null
  newestEntry: number | null
  estimatedSize: string
} {
  if (!MMKVStorage) {
    return {
      totalEntries: 0,
      oldestEntry: null,
      newestEntry: null,
      estimatedSize: "0 KB",
    }
  }

  try {
    const mmkv = new MMKVStorage({ id: "swr-cache-v2" })
    const allKeys = mmkv.getAllKeys().filter((k: string) => k !== METADATA_KEY)

    if (allKeys.length === 0) {
      return {
        totalEntries: 0,
        oldestEntry: null,
        newestEntry: null,
        estimatedSize: "0 KB",
      }
    }

    let oldest = Infinity
    let newest = 0
    let totalSize = 0

    for (const key of allKeys) {
      const json = mmkv.getString(key)
      if (json) {
        totalSize += json.length
        try {
          const entry = JSON.parse(json) as CacheEntry
          if (entry.ts < oldest) oldest = entry.ts
          if (entry.ts > newest) newest = entry.ts
        } catch {}
      }
    }

    return {
      totalEntries: allKeys.length,
      oldestEntry: oldest === Infinity ? null : oldest,
      newestEntry: newest === 0 ? null : newest,
      estimatedSize: `${(totalSize / 1024).toFixed(2)} KB`,
    }
  } catch (error) {
    console.error("[SWR Cache] Failed to get stats:", error)
    return {
      totalEntries: 0,
      oldestEntry: null,
      newestEntry: null,
      estimatedSize: "unknown",
    }
  }
}

/**
 * Invalidate cache entries matching a pattern
 */
export function invalidatePattern(pattern: string | RegExp): number {
  if (!MMKVStorage) return 0

  try {
    const mmkv = new MMKVStorage({ id: "swr-cache-v2" })
    const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern

    const allKeys = mmkv.getAllKeys().filter((k: string) => k !== METADATA_KEY)
    const toDelete = allKeys.filter((key: string) => regex.test(key))

    for (const key of toDelete) {
      mmkv.delete(key)
    }

    if (toDelete.length > 0) {
      console.debug(
        `[SWR Cache] Invalidated ${toDelete.length} entries matching ${pattern}`,
      )
    }

    return toDelete.length
  } catch (error) {
    console.error("[SWR Cache] Failed to invalidate pattern:", error)
    return 0
  }
}

// -----------------------------------------
// Main Entry
// -----------------------------------------

/**
 * SWR Cache Provider function
 * Matches SWR's expected signature: (cache: Readonly<Cache>) => Cache
 * The parent cache is ignored as we use our own persistent storage
 */
export function getCacheProvider(_parentCache?: Readonly<Cache>): Cache {
  try {
    return createMMKVProvider(DEFAULT_CONFIG)
  } catch (error) {
    console.warn("[SWR Cache] MMKV failed, using memory:", error)
    return createMemoryProvider()
  }
}

/**
 * Create a configured cache provider
 * @param config - Configuration overrides
 * @returns SWR-compatible provider function
 */
export function createCacheProvider(
  config?: Partial<CacheConfig>,
): (parentCache?: Readonly<Cache>) => Cache {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }

  return (_parentCache?: Readonly<Cache>) => {
    try {
      return createMMKVProvider(mergedConfig)
    } catch (error) {
      console.warn("[SWR Cache] MMKV failed, using memory:", error)
      return createMemoryProvider()
    }
  }
}

export default getCacheProvider
