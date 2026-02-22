/**
 * Native Storage Implementation
 * Uses MMKV for React Native (10-100x faster than AsyncStorage)
 */

let MMKV: any

try {
  const mmkvModule = require("react-native-mmkv")
  MMKV = mmkvModule.MMKV
} catch (_error) {
  console.warn(
    "[chrry/platform/storage] react-native-mmkv not found. Using fallback.",
  )
}

/**
 * Cross-platform storage adapter
 * Native: Uses MMKV (high-performance)
 */
export class PlatformStorage {
  private storage: any = null

  constructor() {
    if (MMKV) {
      try {
        this.storage = new MMKV()
        console.log("✅ Using MMKV for native storage (10-100x faster!)")
      } catch (error) {
        console.error("❌ MMKV initialization error:", error)
      }
    } else {
      console.warn(
        "⚠️ MMKV not available. Install react-native-mmkv for better performance.",
      )
    }
  }

  set(key: string, value: string): void {
    try {
      if (this.storage) {
        this.storage.set(key, value)
      }
    } catch (error) {
      console.error("Storage set error:", error)
    }
  }

  get(key: string): string | undefined {
    try {
      if (this.storage) {
        return this.storage.getString(key)
      }
      return undefined
    } catch (error) {
      console.error("Storage get error:", error)
      return undefined
    }
  }

  delete(key: string): void {
    try {
      if (this.storage) {
        this.storage.delete(key)
      }
    } catch (error) {
      console.error("Storage delete error:", error)
    }
  }

  getAllKeys(): string[] {
    try {
      if (this.storage) {
        return this.storage.getAllKeys()
      }
      return []
    } catch (error) {
      console.error("Storage getAllKeys error:", error)
      return []
    }
  }

  clearAll(): void {
    try {
      if (this.storage) {
        this.storage.clearAll()
      }
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
      const stringValue =
        typeof value === "string" ? value : JSON.stringify(value)
      platformStorage.set(key, stringValue)
    } catch (error) {
      console.error("setItem error:", error)
    }
  },

  getItem: (key: string) => {
    try {
      const value = platformStorage.get(key)
      if (!value) return null

      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(value)
      } catch {
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
