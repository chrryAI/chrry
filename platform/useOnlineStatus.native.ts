import { useState, useEffect } from "react"

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Try to use NetInfo if available
    let unsubscribe: (() => void) | undefined

    const setupNetInfo = async () => {
      try {
        // Dynamic import to avoid errors if package not installed
        const NetInfo = await import("@react-native-community/netinfo")
        unsubscribe = NetInfo.default.addEventListener((state: any) => {
          setIsOnline(state.isConnected ?? true)
        })
      } catch (error) {
        // NetInfo not available, assume always online
        console.warn(
          "NetInfo not installed. Install @react-native-community/netinfo for network detection.",
        )
      }
    }

    setupNetInfo()

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  return isOnline
}
