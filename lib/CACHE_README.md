# IndexedDB Caching System

## Overview

A unified caching layer using IndexedDB for offline support across web and native platforms.

## Installation

```bash
npm install idb
```

## Quick Start

```typescript
import { cacheData, getCachedData } from "./lib/db"

// Cache data
await cacheData("myKey", { foo: "bar" }, 1000 * 60 * 30) // 30 min TTL

// Retrieve data
const data = await getCachedData("myKey")
```

## API Reference

### `cacheData(key, data, ttl?)`

Cache any JSON-serializable data.

**Parameters:**

- `key` (string): Unique cache key
- `data` (any): Data to cache
- `ttl` (number, optional): Time-to-live in milliseconds

**Example:**

```typescript
await cacheData("apps", appsArray, 1000 * 60 * 60) // 1 hour
```

### `getCachedData<T>(key)`

Retrieve cached data. Returns `null` if not found or expired.

**Parameters:**

- `key` (string): Cache key

**Returns:** `Promise<T | null>`

**Example:**

```typescript
const apps = await getCachedData<appWithStore[]>("apps")
```

### `deleteCachedData(key)`

Delete specific cached data.

### `clearCache()`

Clear all cached data.

### `getCacheSize()`

Get estimated cache size in bytes.

## Usage with SWR

### Pattern 1: Offline Fallback

```typescript
const { data } = useSWR(["key", token], async () => {
  try {
    const data = await fetchData()
    await cacheData("key", data)
    return data
  } catch (error) {
    // Fallback to cache on error
    const cached = await getCachedData("key")
    if (cached) return cached
    throw error
  }
})
```

### Pattern 2: With TTL

```typescript
const { data } = useSWR(["threads", appId], async () => {
  try {
    const threads = await getThreads({ appId })
    // Cache for 30 minutes
    await cacheData(`threads-${appId}`, threads, 1000 * 60 * 30)
    return threads
  } catch (error) {
    return await getCachedData(`threads-${appId}`)
  }
})
```

## What to Cache

### ✅ Recommended

| Data Type           | TTL      | Reason              |
| ------------------- | -------- | ------------------- |
| Apps list           | 1 hour   | Navigation critical |
| Session data        | 1 hour   | User context        |
| User profile        | 24 hours | Rarely changes      |
| AI agents           | 1 hour   | Stable list         |
| Stores              | 1 hour   | Navigation          |
| Threads (recent 50) | 30 min   | Chat history        |

### ❌ Not Recommended

| Data Type                 | Reason             |
| ------------------------- | ------------------ |
| Chat messages (streaming) | Too transient      |
| Real-time notifications   | Time-sensitive     |
| Search results            | Query-specific     |
| Moods                     | Real-time tracking |
| Large media files         | Use blob storage   |

## Cache Keys Convention

Use descriptive, scoped keys:

```typescript
// Good
"storeApps"
"session"
"threads-app123"
"profile-user456"

// Bad
"data"
"cache1"
"temp"
```

## TTL Guidelines

```typescript
// No TTL - Cache forever (static data)
await cacheData("config", config)

// 5 minutes - Frequently changing
await cacheData("notifications", data, 1000 * 60 * 5)

// 30 minutes - Moderate freshness
await cacheData("threads", data, 1000 * 60 * 30)

// 1 hour - Stable data
await cacheData("apps", data, 1000 * 60 * 60)

// 24 hours - Rarely changes
await cacheData("profile", data, 1000 * 60 * 60 * 24)
```

## Storage Limits

| Browser     | Typical Limit                  |
| ----------- | ------------------------------ |
| Chrome/Edge | ~60% of disk (GBs)             |
| Firefox     | ~50% of disk                   |
| Safari      | ~1GB (can request more)        |
| Mobile      | Device dependent (100s of MBs) |

## Best Practices

1. **Always use try/catch** - IndexedDB can fail
2. **Set appropriate TTLs** - Balance freshness vs offline capability
3. **Use descriptive keys** - Makes debugging easier
4. **Cache selectively** - Don't cache everything
5. **Test offline** - Use DevTools to simulate offline mode
6. **Monitor size** - Use `getCacheSize()` to track usage

## Testing Offline Mode

### Chrome DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Select "Offline" from throttling dropdown
4. Reload page

### Manual Test

```typescript
// Check if data loads from cache
const cached = await getCachedData("apps")
console.log("Cached apps:", cached)
```

## Debugging

```typescript
// View all cache keys
import { getAllCacheKeys } from "./lib/db"
const keys = await getAllCacheKeys()
console.log("Cached keys:", keys)

// Check cache size
import { getCacheSize } from "./lib/db"
const size = await getCacheSize()
console.log("Cache size:", (size / 1024 / 1024).toFixed(2), "MB")

// Clear everything
import { clearCache } from "./lib/db"
await clearCache()
```

## Migration from localStorage

```typescript
// Before (localStorage)
localStorage.setItem("apps", JSON.stringify(apps))
const apps = JSON.parse(localStorage.getItem("apps"))

// After (IndexedDB)
await cacheData("apps", apps)
const apps = await getCachedData("apps")
```

## Performance

- **Write**: ~1-5ms per operation
- **Read**: ~1-3ms per operation
- **Storage**: Much larger than localStorage (5-10MB)
- **Async**: Non-blocking, won't freeze UI

## Examples

See `cache-examples.ts` for complete working examples.
