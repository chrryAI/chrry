import { describe, expect, it } from "vitest"
import type { appWithStore } from "../types"
import { hasStoreApps, merge } from "./appUtils"

describe("hasStoreApps", () => {
  it("returns true if app has store with base app and apps list", () => {
    const app = {
      store: {
        app: { id: "base" },
        apps: [{ id: "1" }],
      },
    } as unknown as appWithStore
    expect(hasStoreApps(app)).toBe(true)
  })

  it("returns false if app is undefined", () => {
    expect(hasStoreApps(undefined)).toBe(false)
  })

  it("returns false if store is missing", () => {
    const app = {} as appWithStore
    expect(hasStoreApps(app)).toBe(false)
  })

  it("returns false if store app is missing", () => {
    const app = { store: { apps: [{ id: "1" }] } } as unknown as appWithStore
    expect(hasStoreApps(app)).toBe(false)
  })

  it("returns false if store apps list is empty", () => {
    const app = {
      store: { app: { id: "base" }, apps: [] },
    } as unknown as appWithStore
    expect(hasStoreApps(app)).toBe(false)
  })
})

describe("merge", () => {
  it("merges new apps into empty list", () => {
    const newApps = [{ id: "1", name: "App 1" }] as appWithStore[]
    const result = merge([], newApps)
    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe("1")
  })

  it("merges new apps into existing list with no overlaps", () => {
    const prevApps = [{ id: "1", name: "App 1" }] as appWithStore[]
    const newApps = [{ id: "2", name: "App 2" }] as appWithStore[]
    const result = merge(prevApps, newApps)
    expect(result).toHaveLength(2)
  })

  it("updates existing apps", () => {
    const prevApps = [{ id: "1", name: "App 1" }] as appWithStore[]
    const newApps = [{ id: "1", name: "App 1 Updated" }] as appWithStore[]
    const result = merge(prevApps, newApps)
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe("App 1 Updated")
  })

  it("preserves store apps from existing app if new app has none", () => {
    const prevApps = [
      {
        id: "1",
        store: { app: { id: "base" }, apps: [{ id: "sub" }] },
      },
    ] as unknown as appWithStore[]

    const newApps = [
      {
        id: "1",
        store: { app: { id: "base" }, apps: [] },
      },
    ] as unknown as appWithStore[]

    const result = merge(prevApps, newApps)
    expect(result[0]!.store?.apps).toHaveLength(1)
  })

  it("overwrites store apps if new app has them", () => {
    const prevApps = [
      {
        id: "1",
        store: { app: { id: "base" }, apps: [{ id: "sub1" }] },
      },
    ] as unknown as appWithStore[]

    const newApps = [
      {
        id: "1",
        store: { app: { id: "base" }, apps: [{ id: "sub2" }] },
      },
    ] as unknown as appWithStore[]

    const result = merge(prevApps, newApps)
    expect(result[0]!.store?.apps).toHaveLength(1)
    expect(result[0]!.store?.apps![0]!.id).toBe("sub2")
  })
})
