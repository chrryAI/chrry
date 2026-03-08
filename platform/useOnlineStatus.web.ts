"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "../utils"

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  )

  useEffect(() => {
    function updateStatus() {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener("online", updateStatus)
    window.addEventListener("offline", updateStatus)

    async function _checkConnection() {
      try {
        const response = await apiFetch("/icon.ico", {
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

    return () => {
      window.removeEventListener("online", updateStatus)
      window.removeEventListener("offline", updateStatus)
    }
  }, [])

  return isOnline
}
