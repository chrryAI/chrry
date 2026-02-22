/**
 * Examples of how to add IndexedDB caching to various SWR calls
 *
 * Usage: Copy the pattern to your components/providers
 */

import useSWR from "swr"
import { cacheData, getCachedData } from "./db"

// ============================================
// Example 1: Cache Threads with TTL
// ============================================
export const useCachedThreads = (token: string, appId?: string) => {
  const cacheKey = `threads-${appId || "all"}`

  return useSWR(token && appId ? ["threads", token, appId] : null, async () => {
    try {
      // Replace with your actual getThreads call
      const threads = await fetch(`/api/threads?appId=${appId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json())

      // Cache for 30 minutes
      await cacheData(cacheKey, threads, 1000 * 60 * 30)
      return threads
    } catch (error) {
      // Fallback to cache on error
      const cached = await getCachedData(cacheKey)
      if (cached) {
        console.log("📦 Using cached threads (offline mode)")
        return cached
      }
      throw error
    }
  })
}

// ============================================
// Example 2: Cache User Profile (Long TTL)
// ============================================
export const useCachedProfile = (token: string) => {
  return useSWR(token ? ["profile", token] : null, async () => {
    try {
      const profile = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json())

      // Cache for 24 hours
      await cacheData("profile", profile, 1000 * 60 * 60 * 24)
      return profile
    } catch (error) {
      const cached = await getCachedData("profile")
      if (cached) {
        console.log("📦 Using cached profile (offline mode)")
        return cached
      }
      throw error
    }
  })
}

// ============================================
// Example 3: Cache AI Agents List
// ============================================
export const useCachedAgents = (token: string) => {
  return useSWR(token ? ["agents", token] : null, async () => {
    try {
      const agents = await fetch("/api/agents", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json())

      // Cache for 1 hour
      await cacheData("agents", agents, 1000 * 60 * 60)
      return agents
    } catch (error) {
      const cached = await getCachedData("agents")
      if (cached) {
        console.log("📦 Using cached agents (offline mode)")
        return cached
      }
      throw error
    }
  })
}

// ============================================
// Example 4: Cache with Manual Invalidation
// ============================================
export const useCachedStores = (token: string) => {
  const { data, mutate } = useSWR(
    token ? ["stores", token] : null,
    async () => {
      try {
        const stores = await fetch("/api/stores", {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json())

        await cacheData("stores", stores)
        return stores
      } catch (error) {
        const cached = await getCachedData("stores")
        if (cached) return cached
        throw error
      }
    },
  )

  // Manually invalidate cache when needed
  const invalidateCache = async () => {
    await cacheData("stores", null) // Clear cache
    mutate() // Refetch
  }

  return { data, invalidateCache }
}

// ============================================
// Pattern Summary
// ============================================
/**
 * 1. Wrap your fetch in try/catch
 * 2. On success: cache the data with optional TTL
 * 3. On error: fallback to cached data
 * 4. Use descriptive cache keys (e.g., 'threads-app123')
 * 5. Set appropriate TTLs based on data freshness needs:
 *    - Real-time data: No cache or very short TTL (1-5 min)
 *    - Frequently changing: Short TTL (15-30 min)
 *    - Stable data: Long TTL (1-24 hours)
 *    - Static data: No TTL (cache forever)
 */
