/**
 * Cross-platform useLocalStorage hook
 * Uses platform storage (localStorage on web, MMKV on native)
 */

import { useState, useCallback } from "react"
import { storage } from "./storage"

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize state with value from storage or initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = storage.getItem(key)
      if (item !== null && item !== undefined) {
        return item as T
      }
      return initialValue instanceof Function ? initialValue() : initialValue
    } catch (error) {
      console.error(`Error loading ${key} from storage:`, error)
      return initialValue instanceof Function ? initialValue() : initialValue
    }
  })

  // Update storage whenever value changes
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function for same API as useState
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value

          // Save to storage
          storage.setItem(key, valueToStore)

          return valueToStore
        })
      } catch (error) {
        console.error(`Error saving ${key} to storage:`, error)
      }
    },
    [key],
  )
  // storedValue removed from deps to prevent infinite loop

  return [storedValue, setValue]
}

export default useLocalStorage
