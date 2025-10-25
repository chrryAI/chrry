import { useState, useEffect } from "react"

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true, // default to true on server
  )
  useEffect(() => {
    function updateStatus() {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener("online", updateStatus)
    window.addEventListener("offline", updateStatus)

    async function checkConnection() {
      try {
        // use a lightweight request; avoid caching
        const response = await fetch("/icon.ico", {
          method: "HEAD",
          cache: "no-store",
        })
        if (response.ok) {
          setIsOnline(true)
        } else {
          setIsOnline(false)
        }
      } catch {
        setIsOnline(false)
      }
    }

    // initial check in case navigator.onLine is wrong
    // checkConnection()

    // recheck every 15s
    // const interval = setInterval(checkConnection, 15000)

    return () => {
      window.removeEventListener("online", updateStatus)
      window.removeEventListener("offline", updateStatus)
      // clearInterval(interval)
    }
  }, [])

  return isOnline
}
