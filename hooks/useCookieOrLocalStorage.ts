import { useCallback, useEffect } from "react"

import { useCookie, usePlatform } from "../platform"
import { platformCookies } from "../platform/cookies"
import useLocalStorage from "./useLocalStorage"
export default function useCookieOrLocalStorage(
  key: string,
  initialValue: any,
  canReadCookie: boolean = false,
) {
  const { isExtension, isNative, isTauri } = usePlatform()

  const isWeb = !isExtension && !isNative && !isTauri

  const [cookie, setCookieInternal] = useCookie(key, initialValue)
  const [local, setLocalInternal] = useLocalStorage(
    key,
    canReadCookie ? cookie : initialValue,
  )

  // Sync cookie to localStorage on mount (for extension/native)
  useEffect(() => {
    if (!canReadCookie) {
      return
    }

    ;(async () => {
      const cookieValue = await platformCookies.get(key)
      if (cookieValue) {
        setLocalInternal(cookieValue)
      }
    })()
  }, [key, canReadCookie, setLocalInternal])

  // Extensions/native: read from cookie (cross-site), write to localStorage
  // Web: read and write to cookie
  const state = isWeb ? cookie : local

  const setState = useCallback(
    (value: any) => {
      if (isWeb) {
        setCookieInternal(value)
      }
      setLocalInternal(value)
    },
    [isWeb, setCookieInternal, setLocalInternal],
  )

  return [state, setState] as const
}
