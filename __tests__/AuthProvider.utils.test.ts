import { describe, expect, it } from "vitest"
import type { appWithStore } from "../types"
import { hasStoreApps, merge } from "../utils/appUtils"

describe("AuthProvider Utils", () => {
  describe("hasStoreApps", () => {
    it("should return false if app is undefined", () => {
      expect(hasStoreApps(undefined)).toBe(false)
    })

    it("should return false if store.app is undefined", () => {
      const app = {
        store: {
          apps: [],
        },
      } as unknown as appWithStore
      expect(hasStoreApps(app)).toBe(false)
    })

    it("should return false if store.apps is missing", () => {
      const app = {
        store: {
          app: { id: "1" },
          // apps is missing
        },
      } as unknown as appWithStore
      expect(hasStoreApps(app)).toBe(false)
    })

    it("should return true if store.app exists and store.apps has items", () => {
      const app = {
        store: {
          app: { id: "1" },
          apps: [{ id: "2" }],
        },
      } as unknown as appWithStore
      expect(hasStoreApps(app)).toBe(true)
    })
  })

  describe("merge", () => {
    it("should merge new apps into empty previous apps", () => {
      const prevApps: appWithStore[] = []
      const newApps = [{ id: "1", name: "App 1" }] as appWithStore[]
      const result = merge(prevApps, newApps)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(newApps[0])
    })

    it("should add new apps to existing apps", () => {
      const prevApps = [{ id: "1", name: "App 1" }] as appWithStore[]
      const newApps = [{ id: "2", name: "App 2" }] as appWithStore[]
      const result = merge(prevApps, newApps)
      expect(result).toHaveLength(2)
      expect(result).toEqual(expect.arrayContaining([...prevApps, ...newApps]))
    })

    it("should update existing apps with new data", () => {
      const prevApps = [{ id: "1", name: "App 1" }] as appWithStore[]
      const newApps = [{ id: "1", name: "App 1 Updated" }] as appWithStore[]
      const result = merge(prevApps, newApps)
      expect(result).toHaveLength(1)
      expect(result[0]?.name).toBe("App 1 Updated")
    })

    it("should preserve store apps when new app has no store apps but existing app does", () => {
      const prevApp = {
        id: "1",
        name: "App 1",
        store: {
          app: { id: "1" },
          apps: [{ id: "2" }],
        },
      } as unknown as appWithStore

      const newApp = {
        id: "1",
        name: "App 1 Updated",
        store: {
          app: { id: "1" },
          apps: [], // Empty store apps
        },
      } as unknown as appWithStore

      const result = merge([prevApp], [newApp])
      expect(result).toHaveLength(1)
      // Should preserve the previous store with apps
      expect(hasStoreApps(result[0])).toBe(true)
      expect(result[0]?.store?.apps).toHaveLength(1)
      expect(result[0]?.name).toBe("App 1 Updated")
    })

    it("should use new store apps if provided", () => {
      const prevApp = {
        id: "1",
        name: "App 1",
        store: {
          app: { id: "1" },
          apps: [{ id: "2" }],
        },
      } as unknown as appWithStore

      const newApp = {
        id: "1",
        name: "App 1 Updated",
        store: {
          app: { id: "1" },
          apps: [{ id: "3" }, { id: "4" }], // New store apps
        },
      } as unknown as appWithStore

      const result = merge([prevApp], [newApp])
      expect(result).toHaveLength(1)
      expect(result[0]?.store?.apps).toHaveLength(2)
      expect(result[0]?.store?.apps[0]?.id).toBe("3")
    })
  })
})
