import { useSWRConfig } from "swr"

export default function useCache() {
  const { cache } = useSWRConfig()

  // Clear all SWR cache keys

  return {
    clear: (k?: string) => {
      for (const key of cache.keys()) {
        if (key === k) {
          cache.delete(key)
          break
        } else {
          cache.delete(key)
        }
      }
    },
  }
}
