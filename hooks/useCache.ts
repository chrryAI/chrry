import { useSWRConfig } from "swr"

export function useCache() {
  const { cache } = useSWRConfig()

  // Clear all SWR cache keys

  return {
    clear: (k?: string) => {
      // If no key is provided, clear everything
      if (!k) {
        for (const key of cache.keys()) {
          cache.delete(key)
        }
        return
      }

      // If a key/pattern is provided, only delete matching keys
      for (const key of cache.keys()) {
        // SWR keys are often serialized strings. We use includes for partial matching
        // to support clearing cache for a specific resource type (e.g. "app")
        if (typeof key === "string" && key.includes(k)) {
          cache.delete(key)
        }
      }
    },
  }
}

export default useCache
