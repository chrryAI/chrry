/**
 * Cross-platform SWR Cache Provider - Web
 * Uses Dexie (IndexedDB) with TTL-based garbage collection
 *
 * Features:
 * - Hybrid memory + IndexedDB persistence for instant reads
 * - TTL-based expiration with automatic cleanup
 * - Schema versioning with migration support
 * - LRU eviction when max entries exceeded
 * - Background garbage collection
 * - Quota exceeded handling with graceful degradation
 * - Retry logic for transient IndexedDB failures
 */

import type { Cache } from "swr"
import Dexie from "dexie"

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
  /** Max retry attempts for IndexedDB operations */
  maxRetries: number
  /** Base delay for exponential backoff (ms) */
  retryBaseDelay: number
}

const DEFAULT_CONFIG: CacheConfig = {
  ttl: 60 * 60 * 1000, // 1 hour
  maxEntries: 1000,
  gcInterval: 5 * 60 * 1000, // 5 minutes
  evictionBatchSize: 100,
  maxRetries: 3,
  retryBaseDelay: 100,
}

// Current schema version - increment when making breaking changes
const SCHEMA_VERSION = 2

// -----------------------------------------
// Cache Entry Type
// -----------------------------------------

interface CacheEntry {
  key: string
  value: any
  ts: number // Created/updated timestamp
  lastAccess: number // Last access timestamp for LRU
  version: number // Schema version for migrations
}

// -----------------------------------------
// Dexie DB for Web
// -----------------------------------------

class SWRDexieDB extends Dexie {
  cache!: Dexie.Table<CacheEntry, string>

  constructor() {
    super("swr-dexie-cache")

    // Version 1: Initial schema
    this.version(1).stores({
      cache: "key, ts",
    })

    // Version 2: Added lastAccess for LRU and version for migrations
    this.version(2)
      .stores({
        cache: "key, ts, lastAccess, version",
      })
      .upgrade((tx) => {
        // Migrate existing entries to new schema
        return tx
          .table("cache")
          .toCollection()
          .modify((entry) => {
            entry.lastAccess = entry.ts
            entry.version = 1
          })
      })
  }
}

// -----------------------------------------
// Retry Helper with Exponential Backoff
// -----------------------------------------

async function withRetry<T>(
  operation: () => Promise<T>,
  config: CacheConfig,
  operationName: string,
): Promise<T | undefined> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      // Don't retry on quota exceeded - it won't help
      if (isQuotaExceeded(error)) {
        console.warn(`[SWR Cache] Quota exceeded during ${operationName}`)
        throw error
      }

      // Exponential backoff
      const delay = config.retryBaseDelay * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  console.error(
    `[SWR Cache] ${operationName} failed after ${config.maxRetries} retries:`,
    lastError,
  )
  return undefined
}

function isQuotaExceeded(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.name === "QuotaExceededError" ||
      error.message.includes("quota") ||
      error.message.includes("storage")
    )
  }
  return false
}

// -----------------------------------------
// Dexie Provider Factory
// -----------------------------------------

function createDexieProvider(config: CacheConfig = DEFAULT_CONFIG): Cache {
  let db: SWRDexieDB | null = null

  // Try to initialize Dexie DB
  try {
    db = new SWRDexieDB()
  } catch (error) {
    console.warn(
      "[SWR Cache] Failed to initialize IndexedDB, using memory-only mode:",
      error,
    )
  }

  // In-memory cache synchronized with IndexedDB
  const memCache = new Map<string, any>()

  // Track if we're in degraded mode (memory-only due to errors)
  let degradedMode = !db

  // GC timer reference for cleanup
  let gcTimer: ReturnType<typeof setInterval> | null = null

  // -----------------------------------------
  // Garbage Collection
  // -----------------------------------------

  async function runGarbageCollection(): Promise<void> {
    if (degradedMode || !db) return

    try {
      const now = Date.now()

      // 1. Delete expired entries
      const expiredKeys = await db.cache
        .where("ts")
        .below(now - config.ttl)
        .primaryKeys()

      if (expiredKeys.length > 0) {
        await db.cache.bulkDelete(expiredKeys)
        expiredKeys.forEach((key) => memCache.delete(key))
        console.debug(
          `[SWR Cache] GC: Removed ${expiredKeys.length} expired entries`,
        )
      }

      // 2. Check total count and evict LRU if needed
      const totalCount = await db.cache.count()

      if (totalCount > config.maxEntries) {
        const toEvict =
          totalCount - config.maxEntries + config.evictionBatchSize

        // Get oldest accessed entries
        const lruEntries = await db.cache
          .orderBy("lastAccess")
          .limit(toEvict)
          .primaryKeys()

        if (lruEntries.length > 0) {
          await db.cache.bulkDelete(lruEntries)
          lruEntries.forEach((key) => memCache.delete(key))
          console.debug(
            `[SWR Cache] GC: Evicted ${lruEntries.length} LRU entries`,
          )
        }
      }
    } catch (error) {
      console.warn("[SWR Cache] GC failed, switching to degraded mode:", error)
      degradedMode = true
    }
  }

  // -----------------------------------------
  // Initialize from IndexedDB
  // -----------------------------------------

  async function initialize(): Promise<void> {
    if (!db) return

    try {
      const now = Date.now()
      const items = await db.cache.toArray()

      let expiredCount = 0
      let loadedCount = 0
      let migratedCount = 0

      for (const item of items) {
        // Check if entry needs migration
        if (item.version !== SCHEMA_VERSION) {
          // Migrate entry
          await db.cache.update(item.key, {
            version: SCHEMA_VERSION,
            lastAccess: item.lastAccess || item.ts,
          })
          migratedCount++
        }

        // Only load non-expired items
        if (now - item.ts <= config.ttl) {
          memCache.set(item.key, item.value)
          loadedCount++
        } else {
          // Queue expired item for deletion
          db.cache.delete(item.key).catch(() => {})
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
      console.warn(
        "[SWR Cache] Failed to initialize from IndexedDB, switching to degraded mode:",
        error,
      )
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
      const value = memCache.get(key)

      // Update lastAccess in background (for LRU tracking)
      if (value !== undefined && !degradedMode && db) {
        db.cache.update(key, { lastAccess: Date.now() }).catch(() => {})
      }

      return value
    },

    set: (key: string, value: any) => {
      memCache.set(key, value)

      if (!degradedMode) {
        // Persist to IndexedDB with retry
        const entry: CacheEntry = {
          key,
          value,
          ts: Date.now(),
          lastAccess: Date.now(),
          version: SCHEMA_VERSION,
        }

        db &&
          withRetry(() => db.cache.put(entry), config, `set(${key})`).catch(
            (error) => {
              if (isQuotaExceeded(error)) {
                // Try to free up space
                runGarbageCollection().then(() => {
                  // Retry once after GC
                  db &&
                    db.cache.put(entry).catch(() => {
                      console.warn("[SWR Cache] Switching to degraded mode")
                      degradedMode = true
                    })
                })
              }
            },
          )
      }
    },

    delete: (key: string) => {
      memCache.delete(key)

      if (!degradedMode && db) {
        // Delete from IndexedDB
        db.cache.delete(key).catch((error) => {
          console.error("[SWR Cache] Failed to delete from IndexedDB:", error)
        })
      }
    },

    keys: () => {
      return memCache.keys()
    },

    // Additional Map-like methods for compatibility
    has: (key: string) => {
      return memCache.has(key)
    },

    clear: () => {
      memCache.clear()
      if (!degradedMode && db) {
        db.cache.clear().catch((error) => {
          console.error("[SWR Cache] Failed to clear IndexedDB:", error)
        })
      }
    },

    get size() {
      return memCache.size
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
 * Clear all cache entries (both memory and IndexedDB)
 */
export async function clearCache(): Promise<void> {
  try {
    const db = new SWRDexieDB()
    await db.cache.clear()
    console.debug("[SWR Cache] Cache cleared")
  } catch (error) {
    console.error("[SWR Cache] Failed to clear cache:", error)
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalEntries: number
  oldestEntry: number | null
  newestEntry: number | null
  estimatedSize: string
}> {
  try {
    const db = new SWRDexieDB()
    const count = await db.cache.count()

    if (count === 0) {
      return {
        totalEntries: 0,
        oldestEntry: null,
        newestEntry: null,
        estimatedSize: "0 KB",
      }
    }

    const oldest = await db.cache.orderBy("ts").first()
    const newest = await db.cache.orderBy("ts").last()

    // Estimate size (rough approximation)
    const entries = await db.cache.toArray()
    const size = entries.reduce((acc, entry) => {
      return acc + JSON.stringify(entry).length
    }, 0)

    return {
      totalEntries: count,
      oldestEntry: oldest?.ts || null,
      newestEntry: newest?.ts || null,
      estimatedSize: `${(size / 1024).toFixed(2)} KB`,
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
export async function invalidatePattern(
  pattern: string | RegExp,
): Promise<number> {
  try {
    const db = new SWRDexieDB()
    const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern

    const keys = await db.cache.toCollection().primaryKeys()
    const toDelete = keys.filter((key) => regex.test(key))

    if (toDelete.length > 0) {
      await db.cache.bulkDelete(toDelete)
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
  if (typeof indexedDB !== "undefined") {
    return createDexieProvider(DEFAULT_CONFIG)
  }

  return createMemoryProvider()
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
    if (typeof indexedDB !== "undefined") {
      return createDexieProvider(mergedConfig)
    }

    return createMemoryProvider()
  }
}

export default getCacheProvider
