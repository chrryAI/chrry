import { useEffect, useState } from "react"
import useLocalStorage from "./useLocalStorage"

function useHasHydrated() {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    setHydrated(true)
  }, [])
  return hydrated
}

function useCountdown(targetDate: Date | null) {
  const [remaining, setRemaining] = useState<number | null>(
    targetDate ? targetDate.getTime() - Date.now() : null,
  )

  useEffect(() => {
    if (!targetDate) return
    const interval = setInterval(() => {
      setRemaining(targetDate.getTime() - Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  if (remaining !== null && remaining < 0) return 0
  return remaining
}

export { useLocalStorage, useHasHydrated, useCountdown }
export { default as useCookieOrLocalStorage } from "./useCookieOrLocalStorage"
export { useDeviceInfo } from "./useDeviceInfo"
export {
  useAppMetadata,
  useStoreMetadata,
  useThreadMetadata,
  useTribeMetadata,
  useTribePostMetadata,
} from "./useMetadata"
export { usePWAInstall } from "./usePWAInstall"
export { useComputedValue, useSyncedState } from "./useSyncedState"
