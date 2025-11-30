import { useSWRConfig } from "swr"

export default function useCache() {
  const { cache } = useSWRConfig()

  // Clear all SWR cache keys

  return {
    clear: () => {
      for (const key of cache.keys()) {
        cache.delete(key)
      }
    },
  }
}
