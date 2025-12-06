import { useState, useEffect, useRef } from "react"

/**
 * A hook that syncs local state with a derived/computed value.
 * Useful when you need local state that can be overridden by user interaction,
 * but should reset to the computed value when dependencies change.
 *
 * @param computedValue - The value to sync with (derived from props/context)
 * @param deps - Dependencies that should trigger a reset to computedValue
 * @returns [value, setValue] - Tuple like useState
 *
 * @example
 * ```tsx
 * // Syncs with floatingInitial, resets when threadId changes
 * const [isChatFloating, setIsChatFloating] = useSyncedState(
 *   floatingInitial,
 *   [threadId]
 * )
 * ```
 */
export function useSyncedState<T>(
  computedValue: T,
  deps?: React.DependencyList,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [localValue, setLocalValue] = useState<T>(computedValue)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // On first render, just use the initial computed value
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // When deps change, reset to computed value
    setLocalValue(computedValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...(deps || [])])

  // Also sync when computedValue changes (but not on first render)
  useEffect(() => {
    if (!isFirstRender.current) {
      setLocalValue(computedValue)
    }
  }, [...(deps || [])])

  return [localValue, setLocalValue]
}

/**
 * A simpler version that ALWAYS syncs with the computed value.
 * Use this when you don't need to override the value locally.
 *
 * @param computedValue - The value to always use
 * @returns The computed value (for consistency with useSyncedState API)
 *
 * @example
 * ```tsx
 * // Always uses floatingInitial, no local override
 * const isChatFloating = useComputedValue(floatingInitial)
 * ```
 */
export function useComputedValue<T>(computedValue: T): T {
  return computedValue
}
