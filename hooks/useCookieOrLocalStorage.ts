import useLocalStorage from "./useLocalStorage"

import { usePlatform, useCookie } from "../platform"
import { platformCookies } from "../platform/cookies"
import { useCallback, useEffect } from "react"
export default function useCookieOrLocalStorage(
  key: string,
  initialValue: any,
  canReadCookie: boolean = false,
) {
  const { isExtension, isNative } = usePlatform()

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
  const state = isExtension || isNative ? local : cookie

  const setState = useCallback(
    (value: any) => {
      if (!isExtension && !isNative) {
        setCookieInternal(value)
      }
      setLocalInternal(value)
    },
    [isExtension, isNative, setCookieInternal, setLocalInternal],
  )

  return [state, setState] as const
}
