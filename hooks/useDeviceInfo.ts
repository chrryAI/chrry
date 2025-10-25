/**
 * Hook to get device info with server-side and client-side detection merged
 *
 * NOTE: This is now just a re-export of usePlatform since PlatformProvider
 * already merges server-side (UAParser) and client-side detection.
 *
 * Server-side detection is more accurate for OS/device type.
 * Client-side detection is better for capabilities (standalone, viewport, etc).
 */

import { usePlatform } from "../platform"

export function useDeviceInfo() {
  const platform = usePlatform()

  // Platform already includes server-side data merged with client-side
  return {
    ...platform,

    // Helper: Get OS name (from UAParser)
    getOSName: (): string => {
      return platform.serverOS?.name || platform.os || "unknown"
    },

    // Helper: Is mobile device (already merged)
    isMobileDevice: (): boolean => {
      return platform.isMobile || platform.device === "mobile"
    },

    // Helper: Is tablet (already merged)
    isTabletDevice: (): boolean => {
      return platform.isTablet || platform.device === "tablet"
    },

    // Helper: Get device type (already merged)
    getDeviceType: (): "mobile" | "tablet" | "desktop" => {
      return platform.device
    },
  }
}
