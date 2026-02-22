/**
 * Web Storage Implementation
 * Uses localStorage for web browsers
 */

/**
 * Cross-platform storage adapter
 * Web: Uses localStorage
 */
import console from "../utils/log"
export class PlatformStorage {
  private storage: Storage | null = null

  constructor() {
    if (typeof window !== "undefined" && window.localStorage) {
      this.storage = window.localStorage
      console.log("✅ Using localStorage for web storage")
    } else {
      console.warn("⚠️ localStorage not available")
    }
  }

  set(key: string, value: string): void {
    try {
      this.storage?.setItem(key, value)
    } catch (error) {
      console.error("Storage set error:", error)
    }
  }

  get(key: string): string | undefined {
    try {
      return this.storage?.getItem(key) || undefined
    } catch (error) {
      console.error("Storage get error:", error)
      return undefined
    }
  }

  delete(key: string): void {
    try {
      this.storage?.removeItem(key)
    } catch (error) {
      console.error("Storage delete error:", error)
    }
  }

  getAllKeys(): string[] {
    try {
      if (!this.storage) return []
      return Object.keys(this.storage)
    } catch (error) {
      console.error("Storage getAllKeys error:", error)
      return []
    }
  }

  clearAll(): void {
    try {
      this.storage?.clear()
    } catch (error) {
      console.error("Storage clearAll error:", error)
    }
  }
}

// Create singleton instance
export const platformStorage = new PlatformStorage()

/**
 * Storage utilities
 */
export const storage = {
  setItem: (key: string, value: any) => {
    try {
      // Always stringify to ensure consistent JSON format
      const stringValue = JSON.stringify(value)
      platformStorage.set(key, stringValue)
    } catch (error) {
      console.error("setItem error:", error)
    }
  },

  getItem: (key: string) => {
    try {
      const value = platformStorage.get(key)
      if (!value) return null

      // Handle empty strings
      if (value === "" || value === "undefined" || value === "null") {
        return null
      }

      // Try to parse as JSON
      try {
        return JSON.parse(value)
      } catch (_parseError) {
        // If it's a plain string (not JSON), re-save it as JSON and return
        console.warn(
          `Could not parse ${key} as JSON, migrating to JSON format:`,
          value,
        )
        // Re-save as proper JSON
        platformStorage.set(key, JSON.stringify(value))
        return value
      }
    } catch (error) {
      console.error("getItem error:", error)
      return null
    }
  },

  removeItem: (key: string) => {
    try {
      platformStorage.delete(key)
    } catch (error) {
      console.error("removeItem error:", error)
    }
  },

  clear: () => {
    try {
      platformStorage.clearAll()
    } catch (error) {
      console.error("clear error:", error)
    }
  },

  getAllKeys: () => {
    try {
      return platformStorage.getAllKeys()
    } catch (error) {
      console.error("getAllKeys error:", error)
      return []
    }
  },
}

export default storage
