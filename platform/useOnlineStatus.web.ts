"use client"

import { apiFetch } from "../utils"
import { useState, useEffect } from "react"

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

    async function checkConnection() {
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
