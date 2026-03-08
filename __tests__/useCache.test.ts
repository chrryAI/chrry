import { beforeEach, describe, expect, it, vi } from "vitest"
import { useCache } from "../hooks/useCache"

// Use vi.hoisted to share variables with the mock factory
const { mockCache } = vi.hoisted(() => {
  return { mockCache: new Map() }
})

vi.mock("swr", () => ({
  useSWRConfig: () => ({
    cache: mockCache,
  }),
}))

describe("useCache", () => {
  beforeEach(() => {
    mockCache.clear()
  })

  it('clear("key") should only delete the specific key and preserve others', () => {
    // Setup cache
    mockCache.set("key1", "value1")
    mockCache.set("key2", "value2")
    mockCache.set("targetKey", "targetValue")
    mockCache.set("key3", "value3")

    const { clear } = useCache()

    // Call clear with specific key
    clear("targetKey")

    // Verification
    expect(mockCache.has("targetKey")).toBe(false)

    // These assertions verify the fix
    expect(mockCache.has("key1")).toBe(true)
    expect(mockCache.has("key2")).toBe(true)
    expect(mockCache.has("key3")).toBe(true)
  })

  it("clear() should delete all keys", () => {
    // Setup cache
    mockCache.set("key1", "value1")
    mockCache.set("key2", "value2")

    const { clear } = useCache()

    // Call clear without args
    clear()

    // Verification
    expect(mockCache.size).toBe(0)
  })
})
